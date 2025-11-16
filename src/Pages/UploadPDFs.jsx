import React, { useEffect, useMemo, useState, useRef } from 'react';
import pdfLibraryBase from '../assets/pdfs';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'pdfLibraryExtras';

function readExtras() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const arr = raw ? JSON.parse(raw) : [];
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

function writeExtras(extras) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(extras ?? []));
		return true;
	} catch {
		return false;
	}
}

function slugify(text) {
		return (text || '')
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '');
}

export default function UploadPDFs() {
	const navigate = useNavigate();
	const [extras, setExtras] = useState(() => readExtras());
	const [title, setTitle] = useState('');
	const [file, setFile] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [message, setMessage] = useState('');
		const fileInputRef = useRef(null);

	useEffect(() => {
		setExtras(readExtras());
	}, []);

	const combined = useMemo(() => {
		return [...pdfLibraryBase, ...extras];
	}, [extras]);

	const handleSave = (e) => {
		e.preventDefault();
		const id = editingId || slugify(title) || `pdf-${Date.now()}`;
		if (!title || !file) {
			setMessage('Please provide both title and file URL.');
			return;
		}
		const next = [...extras];
		const idx = next.findIndex((x) => x.id === id);
		const entry = { id, title, file };
		if (idx >= 0) next[idx] = entry;
		else next.push(entry);
		setExtras(next);
		writeExtras(next);
		setMessage('Saved. You may need to refresh FlipBook for changes to show.');
		setEditingId(null);
		setTitle('');
		setFile('');
	};

		const handleFileSelect = (e) => {
			const f = e?.target?.files?.[0];
			if (!f) return;
			if (f.type !== 'application/pdf') {
				setMessage('Only PDF files are supported.');
				return;
			}
			// Warn for large files
			if (f.size > 5 * 1024 * 1024) {
				setMessage('Warning: files larger than 5MB may not persist well in localStorage.');
			} else {
				setMessage('Reading file...');
			}
			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result;
				// Use the data URL as the file reference so the viewer can load it
				setFile(dataUrl);
				// default title from filename if empty
				setTitle((t) => t || f.name.replace(/\.pdf$/i, ''));
				setMessage('File loaded. Click Add/Update to save to library.');
			};
			reader.onerror = () => setMessage('Failed to read file.');
			reader.readAsDataURL(f);
			// Reset input so same file can be reselected later
			e.target.value = null;
		};

	const handleEdit = (item) => {
		setEditingId(item.id);
		setTitle(item.title);
		setFile(item.file);
		setMessage('Editing existing entry.');
	};

	const handleDelete = (id) => {
		const next = extras.filter((x) => x.id !== id);
		setExtras(next);
		writeExtras(next);
	};

	const handleReset = () => {
		writeExtras([]);
		setExtras([]);
		setTitle('');
		setFile('');
		setEditingId(null);
		setMessage('Custom library cleared.');
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
						<h2 className="text-lg font-medium mb-3">Add or update entry</h2>
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
												<label className="block text-sm mb-1">File URL</label>
												<div className="flex gap-2">
													<input
														type="text"
														value={file}
														onChange={(e) => setFile(e.target.value)}
														className="flex-1 rounded-md bg-gray-900 border border-gray-700 px-3 py-2"
														placeholder="/my.pdf or https://..."
														required
													/>
													<button
														type="button"
														onClick={() => fileInputRef.current?.click()}
														className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm"
													>
														Upload file
													</button>
												</div>
												<p className="text-xs text-gray-400 mt-1">Tip: Place PDFs in <code className="font-mono">public/</code> and reference like <code className="font-mono">/my.pdf</code>, use a full URL, or upload a local PDF.</p>
												{file && file.startsWith && file.startsWith('data:') ? (
													<p className="text-xs text-emerald-200 mt-2">Local file loaded — <a className="underline" href={file} target="_blank" rel="noreferrer">open</a></p>
												) : null}
											</div>
							<div className="flex items-center gap-2 pt-1">
								<button type="submit" className="rounded-md bg-green-600 hover:bg-green-500 px-3 py-2 text-sm">
									{editingId ? 'Update' : 'Add'}
								</button>
								{editingId && (
									<button type="button" onClick={() => { setEditingId(null); setTitle(''); setFile(''); setMessage(''); }} className="rounded-md bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm">Cancel</button>
								)}
								<button type="button" onClick={handleReset} className="ml-auto rounded-md bg-red-600/80 hover:bg-red-600 px-3 py-2 text-sm">Clear custom library</button>
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
					<p>Note: The viewer reads a snapshot of the library on load. After saving, use "Refresh app" to see changes in the FlipBook.</p>
				</div>
			</div>
		</div>
	);
}

