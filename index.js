document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    const resultContainer = document.querySelector('.result-container');
    const resultCode = document.getElementById('result-code');
    const downloadBtn = document.getElementById('download-btn');
    const copyBtn = document.getElementById('copy-btn');
    const newFileBtn = document.getElementById('new-file-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const form = document.getElementById('upload-form');
    const customOptions = document.querySelector('.custom-options');
    const dropZone = document.querySelector('.file-upload-container');
    
    let currentFileId = null;
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('drop-zone-highlight');
    }
    
    function unhighlight() {
        dropZone.classList.remove('drop-zone-highlight');
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files.length > 0) {
            droppedFile = files[0]; 
            handleFiles(files);
        }
    }
    
    function handleFiles(files) {
        try {
            if (!files || files.length === 0) {
                console.error('No files provided to handleFiles');
                return;
            }
            
            const file = files[0];
            console.log('Processing file:', file.name, file.type, file.size);
            
            if (!file.name.toLowerCase().endsWith('.lua') && !file.name.toLowerCase().endsWith('.txt')) {
                alert('Please select a Lua file (.lua extension) or a text file containing Lua code (.txt)');
                return;
            }
            
            fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            obfuscateBtn.disabled = false;
        } catch (error) {
            console.error('Error handling files:', error);
            alert('Error processing the selected file. Please try again.');
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / 1048576).toFixed(1) + ' MB';
        }
    }
    
    const presetRadios = document.querySelectorAll('input[name="preset"]');
    presetRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const preset = this.value;
            
            if (preset === 'none') {
                customOptions.style.display = 'block';
            } else {
                customOptions.style.display = 'none';
            }
        });
    });
    
    function setPresetOptions(options) {
        document.querySelector('input[name="controlFlow"]').checked = options.controlFlow || false;
        document.querySelector('input[name="stringEncoding"]').checked = options.stringEncoding || false;
        document.querySelector('input[name="variableRenaming"]').checked = options.variableRenaming || false;
        document.querySelector('input[name="garbageCode"]').checked = options.garbageCode || false;
        document.querySelector('input[name="opaquePredicates"]').checked = options.opaquePredicates || false;
        document.querySelector('input[name="functionInlining"]').checked = options.functionInlining || false;
        document.querySelector('input[name="dynamicCode"]').checked = options.dynamicCode || false;
        document.querySelector('input[name="compressor"]').checked = options.compressor || false;
        document.querySelector('input[name="bytecodeEncoder"]').checked = options.bytecodeEncoder || false;
        document.querySelector('input[name="stringToExpressions"]').checked = options.stringToExpressions || false;
        document.querySelector('input[name="vmGenerator"]').checked = options.vmGenerator || false;
        document.querySelector('input[name="wrapInFunction"]').checked = options.wrapInFunction || false;
    }
    
    let droppedFile = null;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            const file = droppedFile || (fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null);
            
            if (!file) {
                alert('Please select a file first');
                return;
            }
            
            if (!file.name.toLowerCase().endsWith('.lua') && !file.name.toLowerCase().endsWith('.txt')) {
                alert('Please select a Lua file (.lua extension) or a text file containing Lua code (.txt)');
                return;
            }
            
            loadingOverlay.style.display = 'flex';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const presetInput = document.querySelector('input[name="preset"]:checked');
            if (!presetInput) {
                alert('Please select an obfuscation preset');
                loadingOverlay.style.display = 'none';
                return;
            }
            
            const preset = presetInput.value;
            formData.append('preset', preset);
            
            if (preset === 'none') {
                document.querySelectorAll('.checkbox-grid input[type="checkbox"]').forEach(checkbox => {
                    formData.append(checkbox.name, checkbox.checked);
                });
            }
            
            console.log('Submitting file for obfuscation:', file.name);
            
            fetch('/api/obfuscate', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw new Error(data.error || `Server error: ${response.status} ${response.statusText}`);
                    }
                    return data;
                })
                .catch(jsonError => {
                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status} ${response.statusText}`);
                    }
                    throw new Error('Invalid response format from server');
                });
            })
            .then(data => {
                loadingOverlay.style.display = 'none';
                
                if (data.success) {
                    currentFileId = data.file_id;
                    
                    resultCode.textContent = data.obfuscated_code;
                    
                    document.querySelector('.upload-container').style.display = 'none';
                    resultContainer.style.display = 'block';
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                loadingOverlay.style.display = 'none';
                alert('Error: ' + error.message);
                console.error('Obfuscation error:', error);
            });
        } catch (error) {
            loadingOverlay.style.display = 'none';
            alert('An unexpected error occurred: ' + error.message);
            console.error('Form submission error:', error);
        }
    });
    
    downloadBtn.addEventListener('click', function() {
        if (!currentFileId) {
            alert('No file to download');
            return;
        }
        
        fetch(`/api/files/${currentFileId}`)
            .then(response => response.json())
            .then(data => {
                const blob = new Blob([data.obfuscated_content], { type: 'text/plain' });
                
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                
                let originalFilename = data.file.original_filename;
                
                if (originalFilename.toLowerCase().endsWith('.txt')) {
                    originalFilename = originalFilename.substring(0, originalFilename.length - 4) + '.lua';
                }
                downloadLink.download = originalFilename.replace('.lua', '_obfuscated.lua');
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            })
            .catch(error => {
                console.error('Error downloading file:', error);
                alert('Error downloading file.');
            });
    });
    
    copyBtn.addEventListener('click', function() {
        const code = resultCode.textContent;
        
        navigator.clipboard.writeText(code)
            .then(() => {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                alert('Failed to copy: ' + err);
            });
    });
    
    newFileBtn.addEventListener('click', function() {
        form.reset();
        fileInfo.textContent = 'No file selected';
        obfuscateBtn.disabled = true;
        
        document.querySelector('.upload-container').style.display = 'block';
        resultContainer.style.display = 'none';
        
        fileInput.value = '';
        currentFileId = null;
        droppedFile = null;
    });
});
