import React, { useEffect, useMemo, useState, useRef } from 'react';
import pdfLibraryBase from '../assets/pdfs';
import { useNavigate } from 'react-router-dom';

// Helper to get auth header
function getAuthHeader() {
	const user = import.meta.env.VITE_BASIC_AUTH_USER || 'admin';
	const pass = import.meta.env.VITE_BASIC_AUTH_PASS || 'admin';
	return `Basic ${btoa(`${user}:${pass}`)}`;
}

export default function UploadPDFs() {
	const navigate = useNavigate();
	const [extras, setExtras] = useState([]);
	const [title, setTitle] = useState('');
	const [file, setFile] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef(null);

	// Fetch PDFs from API on mount
	useEffect(() => {
		fetchPDFs();
	}, []);

	const fetchPDFs = async () => {
		try {
			const response = await fetch('/api/list');
			const data = await response.json();
			if (data.success) {
				setExtras(data.data || []);
			}
		} catch (error) {
			console.error('Failed to fetch PDFs:', error);
		}
	};

	const combined = useMemo(() => {
		return [...pdfLibraryBase, ...extras];
	}, [extras]);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!title) {
			setMessage('Please provide a title.');
			return;
		}
		
		// If we have a selected file (from file input), upload it
		if (selectedFile) {
			setLoading(true);
			setMessage('Uploading PDF to Vercel Blob...');
			
			try {
				const formData = new FormData();
				formData.append('file', selectedFile);
				formData.append('title', title);

				const response = await fetch('/api/upload', {
					method: 'POST',
					headers: {
						'Authorization': getAuthHeader(),
					},
					body: formData,
				});

				const data = await response.json();
				
				if (data.success) {
					setMessage('PDF uploaded successfully!');
					await fetchPDFs(); // Refresh list
					setTitle('');
					setFile('');
					setSelectedFile(null);
				} else {
					setMessage(`Upload failed: ${data.error || 'Unknown error'}`);
				}
			} catch (error) {
				setMessage(`Upload error: ${error.message}`);
			} finally {
				setLoading(false);
			}
		} else if (file) {
			setMessage('Please use the Upload file button to select a PDF file.');
		} else {
			setMessage('Please select a file to upload.');
		}
	};

	const handleFileSelect = (e) => {
		const f = e?.target?.files?.[0];
		if (!f) return;
		if (f.type !== 'application/pdf') {
			setMessage('Only PDF files are supported.');
			return;
		}
		// Store the actual file for upload
		setSelectedFile(f);
		// Show filename in the input
		setFile(f.name);
		// Auto-fill title from filename if empty
		setTitle((t) => t || f.name.replace(/\.pdf$/i, ''));
		setMessage(`File selected: ${f.name}. Click Add to upload.`);
		// Reset input so same file can be reselected later
		e.target.value = null;
	};

	const handleEdit = () => {
		setMessage('Editing is not supported for uploaded PDFs. Please delete and re-upload if needed.');
	};

	const handleDelete = async (id) => {
		if (!confirm(`Delete PDF "${id}"?`)) return;
		
		setLoading(true);
		setMessage('Deleting...');
		
		try {
			const response = await fetch(`/api/delete?id=${encodeURIComponent(id)}`, {
				method: 'DELETE',
				headers: {
					'Authorization': getAuthHeader(),
				},
			});

			const data = await response.json();
			
			if (data.success) {
				setMessage('PDF deleted successfully!');
				await fetchPDFs(); // Refresh list
			} else {
				setMessage(`Delete failed: ${data.error || 'Unknown error'}`);
			}
		} catch (error) {
			setMessage(`Delete error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		if (!confirm('Delete all custom PDFs from Vercel Blob?')) return;
		
		setLoading(true);
		setMessage('Deleting all custom PDFs...');
		
		// Delete each custom PDF one by one
		try {
			for (const item of extras) {
				await fetch(`/api/delete?id=${encodeURIComponent(item.id)}`, {
					method: 'DELETE',
					headers: {
						'Authorization': getAuthHeader(),
					},
				});
			}
			setMessage('All custom PDFs cleared.');
			await fetchPDFs();
			setTitle('');
			setFile('');
			setSelectedFile(null);
		} catch (error) {
			setMessage(`Clear error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const goHome = () => navigate('/');

		return (
			<div className="min-h-screen book-bg text-gray-100 px-4 py-8">
				<div className="mx-auto w-full max-w-4xl relative z-10">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-semibold">Manage PDF Library</h1>
					<div className="flex gap-2">
						<button onClick={goHome} className="rounded-md bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm">Back to viewer</button>
						<button onClick={() => window.location.reload()} className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm">Refresh app</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<section className="rounded-xl border border-gray-800 bg-gray-850/50 bg-gray-800 p-5">
						<h2 className="text-lg font-medium mb-3">Upload new PDF</h2>
									<form onSubmit={handleSave} className="space-y-3">
										<input
											ref={fileInputRef}
											type="file"
											accept="application/pdf"
											onChange={handleFileSelect}
											className="hidden"
										/>
							<div>
								<label className="block text-sm mb-1">Title</label>
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2"
									placeholder="e.g. My Brochure"
									required
								/>
							</div>
							<div>
								<label className="block text-sm mb-1">PDF File</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={file}
										readOnly
										className="flex-1 rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-400"
										placeholder="No file selected"
									/>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm whitespace-nowrap"
										disabled={loading}
									>
										Choose file
									</button>
								</div>
								<p className="text-xs text-gray-400 mt-1">Select a PDF file to upload to Vercel Blob storage.</p>
							</div>
							<div className="flex items-center gap-2 pt-1">
								<button 
									type="submit" 
									className="rounded-md bg-green-600 hover:bg-green-500 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={loading || !selectedFile}
								>
									{loading ? 'Uploading...' : 'Upload PDF'}
								</button>
								{(title || file) && (
									<button 
										type="button" 
										onClick={() => { setTitle(''); setFile(''); setSelectedFile(null); setMessage(''); }} 
										className="rounded-md bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm"
										disabled={loading}
									>
										Clear
									</button>
								)}
								<button 
									type="button" 
									onClick={handleReset} 
									className="ml-auto rounded-md bg-red-600/80 hover:bg-red-600 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={loading || extras.length === 0}
								>
									Delete all
								</button>
							</div>
							{message && <p className="text-sm text-emerald-300">{message}</p>}
						</form>
					</section>

					<section className="rounded-xl border border-gray-800 bg-gray-800 p-5">
						<h2 className="text-lg font-medium mb-3">Current entries</h2>
						<ul className="divide-y divide-gray-800">
							{combined.map((item) => (
								<li key={item.id} className="py-3 flex items-start justify-between gap-3">
									<div>
										<p className="font-medium">{item.title}</p>
										<p className="text-xs text-gray-400 break-all">{item.file}</p>
										{!pdfLibraryBase.find((b) => b.id === item.id) && (
											<span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/40 text-emerald-200">custom</span>
										)}
									</div>
									<div className="flex items-center gap-2">
										{!pdfLibraryBase.find((b) => b.id === item.id) ? (
											<>
												<button onClick={() => handleEdit(item)} className="rounded-md bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs">Edit</button>
												<button onClick={() => handleDelete(item.id)} className="rounded-md bg-red-600/80 hover:bg-red-600 px-2 py-1 text-xs">Delete</button>
											</>
										) : (
											<span className="text-xs text-gray-400">built-in</span>
										)}
									</div>
								</li>
							))}
							{combined.length === 0 && (
								<li className="py-6 text-gray-400 text-sm">No entries yet.</li>
							)}
						</ul>
					</section>
				</div>

				<div className="mt-6 text-xs text-gray-400">
					<p>Note: PDFs are stored in Vercel Blob storage. After uploading, use "Refresh app" to see changes in the FlipBook viewer.</p>
				</div>
			</div>
		</div>
	);
}

