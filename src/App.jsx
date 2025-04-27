import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { saveAs } from 'file-saver';
import { Lock, Unlock, Upload, Key, Shield } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file || !password) {
      alert('Please select a file and enter password');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (mode === 'encrypt') {
          const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
          const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
          const blob = new Blob([encrypted]);
          saveAs(blob, `${file.name}.enc`);
        } else {
          const decrypted = CryptoJS.AES.decrypt(e.target.result, password);
          const typedArray = new Uint8Array(decrypted.sigBytes);
          for (let i = 0; i < decrypted.sigBytes; i++) {
            typedArray[i] = decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8) & 0xff;
          }
          const blob = new Blob([typedArray]);
          saveAs(blob, file.name.replace('.enc', ''));
        }
      } catch (err) {
        alert('Operation failed. Wrong password or file format.');
      } finally {
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      alert('Error reading file');
      setProcessing(false);
    };

    if (mode === 'decrypt') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white border-opacity-20">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 rounded-full p-4 shadow-lg">
            <Shield size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-800l mb-2">Secure File Vault</h1>
        <p className="text-center text-slate-600 mb-8">Encrypt and decrypt your files with military-grade AES encryption</p>

        <div className="mb-8">
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-indigo-400 bg-indigo-900 bg-opacity-50' : 'border-indigo-500 border-opacity-40 hover:border-indigo-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload size={32} className="mx-auto mb-4 text-indigo-300" />
            <p className="text-slate-600 mb-2">
              {file ? file.name : 'Drag & drop your file here or click to browse'}
            </p>
            {file && (
              <p className="text-indigo-300 text-sm">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <Key size={18} className="text-indigo-300" />
          </div>
          <input
            type="password"
            placeholder="Enter encryption password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 pl-10 bg-indigo-900 bg-opacity-30 border border-indigo-400 border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-indigo-300"
          />
        </div>

        <div className="bg-indigo-900 bg-opacity-30 rounded-xl p-1 flex mb-8">
          <button
            onClick={() => setMode('encrypt')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              mode === 'encrypt'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:bg-indigo-800 hover:bg-opacity-50'
            }`}
          >
            <Lock size={18} />
            Encrypt
          </button>
          <button
            onClick={() => setMode('decrypt')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              mode === 'decrypt'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 hover:bg-indigo-800 hover:bg-opacity-50'
            }`}
          >
            <Unlock size={18} />
            Decrypt
          </button>
        </div>

        <button
          onClick={handleProcess}
          disabled={processing || !file || !password}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-xl ${
            (!file || !password) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {processing ? (
            <>Processing...</>
          ) : (
            <>
              {mode === 'encrypt' ? (
                <>
                  <Lock size={18} />
                  Encrypt & Download
                </>
              ) : (
                <>
                  <Unlock size={18} />
                  Decrypt & Download
                </>
              )}
            </>
          )}
        </button>

        <p className="mt-6 text-center text-slate-600 text-sm">
          Your files never leave your device. All encryption/decryption happens locally.
        </p>
      </div>
    </div>
  );
}