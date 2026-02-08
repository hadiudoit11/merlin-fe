'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFinancial';
import { getFileValidationErrors, formatFileSize, isValidPdfFile } from '@/lib/financial-utils';
import { toast } from 'sonner';

export function FileUploadPanel() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploading, error, uploadStatement } = useFileUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const errors = getFileValidationErrors(file);
    
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadStatement(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(`File uploaded successfully! Import ID: ${result.import_id}`);
      
      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      toast.error('Failed to upload file');
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Upload Statement</h2>
        <p className="text-muted-foreground">
          Upload PDF financial statements for processing and review
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload PDF Statement
          </CardTitle>
          <CardDescription>
            Drag and drop your PDF statement here, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : selectedFile 
                ? 'border-green-500 bg-green-50' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Button onClick={handleRemoveFile} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Statement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Upload your statement</h3>
                  <p className="text-sm text-muted-foreground">
                    PDF files only, max 10MB
                  </p>
                </div>
                <Button onClick={openFileDialog} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground">
                  or drag and drop here
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Uploading Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 100 
                  ? 'Processing your statement...' 
                  : 'Upload complete! Processing transactions...'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Upload Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* File Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            File Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Supported Formats</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">PDF</Badge>
                <span className="text-sm text-muted-foreground">Bank statements, credit card statements</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">File Size</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Max 10MB</Badge>
                <span className="text-sm text-muted-foreground">Compress large files if needed</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Processing Time</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">1-5 minutes</Badge>
                <span className="text-sm text-muted-foreground">Depends on file size and complexity</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Security</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Encrypted</Badge>
                <span className="text-sm text-muted-foreground">Files are processed securely</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Ensure the PDF is clear and readable for better transaction extraction</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Upload complete statements rather than partial pages</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Check that all transaction details are visible in the PDF</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Use the latest statement version for accurate data</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 