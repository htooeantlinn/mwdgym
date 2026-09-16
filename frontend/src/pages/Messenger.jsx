import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Search,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Square,
  FileText,
  FileArchive,
  Music,
  Video,
  File,
  Download,
  X,
  Trash2,
  Volume2,
} from 'lucide-react';

const SUPPORTED_AUDIO_TYPES = ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];

const pickAudioMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod|Macintosh|Mac OS X/.test(ua);
  const types = isIOS
    ? ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']
    : SUPPORTED_AUDIO_TYPES;
  for (const t of types) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {}
  }
  return '';
};

export const Messenger = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [brokenFiles, setBrokenFiles] = useState(() => new Set());
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recTimerRef = useRef(null);
  const recStreamRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messenger/contacts');
      const data = res.data || [];
      setContacts(data);
      if (!activeContact && data.length > 0) {
        setActiveContact(data[0].user);
        setMobileView('chat');
      }
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messenger/messages/${userId}`);
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);
  useEffect(() => { if (activeContact?.id) fetchMessages(activeContact.id); }, [activeContact?.id]);
  useEffect(() => { if (activeContact?.id) setMobileView('chat'); }, [activeContact?.id]);

  useEffect(() => {
    if (!activeContact?.id) return;
    const interval = setInterval(async () => {
      try {
        const lastId = messages.length > 0 ? messages[messages.length - 1].id : null;
        if (lastId) {
          const res = await api.get(`/messenger/poll?with=${activeContact.id}&after=${lastId}`);
          if (res.data && res.data.length > 0) {
            setMessages(prev => [...prev, ...res.data]);
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [activeContact?.id, messages]);

  const selectContact = (u) => {
    setActiveContact(u);
    setMobileView('chat');
  };

  const openContacts = () => {
    setMobileView('list');
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { alert('File too large (max 15MB)'); return; }
    setSelectedFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { alert('File too large'); return; }
    setSelectedFile(f);
    if (f.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null); setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickAudioMimeType();
      let mr;
      try {
        mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      } catch {
        mr = new MediaRecorder(stream);
      }
      const chunks = [];
      mr.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      mr.onerror = () => {
        try { mr.stop(); } catch {}
        setIsRecording(false);
        clearInterval(recTimerRef.current);
      };
      mr.onstop = () => {
        const hasAudio = chunks.length > 0 && chunks.some(c => c.size > 0);
        if (hasAudio) {
          const type = (mr.mimeType && mr.mimeType.split(';')[0]) || 'audio/mp4';
          const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : type.includes('mp3') ? 'mp3' : 'webm';
          const blob = new Blob(chunks, { type });
          const f = new File([blob], `voice-${Date.now()}.${ext}`, { type });
          setSelectedFile(f);
          setPreviewUrl(null);
        } else {
          setSelectedFile(null);
          setPreviewUrl(null);
        }
        stream.getTracks().forEach(t => t.stop());
      };
      recStreamRef.current = stream;
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true); setRecTime(0);
      recTimerRef.current = setInterval(() => setRecTime(s => s + 1), 1000);
    } catch { alert('Microphone access denied'); }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') {
      try { mr.stop(); } catch { try { mr.stop(); } catch {} }
    }
    setIsRecording(false);
    clearInterval(recTimerRef.current);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || !activeContact) return;
    const msgText = text.trim();
    const fileToSend = selectedFile;
    setText('');
    const prevFile = selectedFile; const prevUrl = previewUrl;
    removeFile();
    try {
      let res;
      if (fileToSend) {
        const fd = new FormData();
        fd.append('recipientId', String(activeContact.id));
        fd.append('content', msgText);
        fd.append('file', fileToSend);
        res = await api.post('/messenger/send-file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/messenger/send', { recipientId: String(activeContact.id), content: msgText });
      }
      setMessages(prev => [...prev, res.data]);
      fetchContacts();
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Failed to send', err);
      if (prevFile) { setSelectedFile(prevFile); setPreviewUrl(prevUrl); }
      setText(msgText);
    }
  };

  const renderFile = (m) => {
    if (!m.fileUrl) return null;
    if (brokenFiles.has(m.fileUrl)) {
      return (
        <div className="mt-2 flex items-center gap-2.5 p-2.5 rounded-xl bg-black/5 dark:bg-white/20 border border-black/10">
          <div className="w-9 h-9 rounded-lg bg-slate-400/20 text-slate-500 flex items-center justify-center shrink-0"><File className="w-4 h-4" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate max-w-[180px]">{m.fileName || 'file'}</p>
            <p className="text-[10px] text-slate-500">File no longer available</p>
          </div>
          <Download className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      );
    }
    const markBroken = () => setBrokenFiles(prev => new Set(prev).add(m.fileUrl));
    const type = (m.fileType || '').toLowerCase();
    const name = m.fileName || 'file';
    const isImg = type.startsWith('image/');
    const isVideo = type.startsWith('video/');
    const isAudio = type.startsWith('audio/');
    const size = m.fileSize ? ` • ${(m.fileSize/1024).toFixed(1)} KB` : '';
    if (isImg) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
          <img src={m.fileUrl} alt={name} onError={markBroken} loading="lazy" className="max-w-[240px] max-h-56 object-contain bg-black/5 dark:bg-white/5 cursor-pointer" onClick={() => window.open(m.fileUrl, '_blank')} />
          <div className="px-2 py-1 flex items-center justify-between bg-black/5 dark:bg-white/5">
            <span className="truncate font-medium text-[10px]">{name}{size}</span>
            <a href={m.fileUrl} download={name} className="p-1 hover:text-red-500"><Download className="w-3 h-3" /></a>
          </div>
        </div>
      );
    }
    if (isVideo) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-black/10">
          <video src={m.fileUrl} onError={markBroken} controls className="max-w-[240px] max-h-48 bg-black" />
          <div className="px-2 py-1 text-[10px] flex justify-between bg-black/5 dark:bg-white/5"><span className="truncate">{name}{size}</span><a href={m.fileUrl} download={name}><Download className="w-3 h-3" /></a></div>
        </div>
      );
    }
    if (isAudio) {
      return (
        <div className="mt-2 p-2 rounded-xl bg-black/5 dark:bg-white/10 flex items-center gap-2 border border-black/10">
          <Volume2 className="w-4 h-4 text-red-500 shrink-0" />
          <audio src={m.fileUrl} onError={markBroken} controls className="h-8 w-full min-w-0 flex-1 max-w-[200px]" />
          <a href={m.fileUrl} download={name} className="p-1"><Download className="w-3.5 h-3.5" /></a>
        </div>
      );
    }
    const Icon = name.endsWith('.zip') || name.endsWith('.rar') ? FileArchive : name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx') ? FileText : File;
    return (
      <a href={m.fileUrl} download={name} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2.5 p-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 hover:bg-black/10 transition">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate max-w-[140px]">{name}</p>
          <p className="text-[10px] text-slate-500">{type || 'file'}{size}</p>
        </div>
        <Download className="w-4 h-4 text-slate-400 shrink-0" />
      </a>
    );
  };

  const filteredContacts = contacts.filter(c =>
    c.user?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.role?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="flex-1 min-h-0 flex flex-col md:flex-row surface overflow-hidden">
      {/* Left Contacts Sidebar */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-slate-200 dark:border-zinc-800/80 flex-col shrink-0 bg-slate-50/50 dark:bg-zinc-900/20`}>
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 sticky top-0 bg-slate-50/90 dark:bg-zinc-900/90 backdrop-blur z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Gym Chat</h2>
            <span className="text-[11px] font-semibold text-slate-400">{contacts.length} members</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coaches & athletes..." className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/50">
          {loadingContacts ? <div className="p-8 text-center text-xs text-slate-400">Loading contacts...</div> : filteredContacts.length === 0 ? <div className="p-8 text-center text-xs text-slate-400">No users found.</div> : filteredContacts.map((item) => {
            const u = item.user; const isSelected = activeContact?.id === u.id;
            return (
              <div key={u.id} onClick={() => selectContact(u)} className={`p-3.5 flex items-center gap-3 cursor-pointer transition active:bg-red-500/5 ${isSelected ? 'bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-600' : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'}`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-500/80 text-white font-bold flex items-center justify-center text-sm shadow-sm">{u.displayName?.charAt(0) || 'U'}</div>
                  {item.unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#121215]">{item.unread}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className="font-bold text-xs text-slate-900 dark:text-white truncate">{u.displayName}</span><span className="text-[10px] text-slate-400 shrink-0">{u.role}</span></div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">{item.lastMessage || 'Start conversation...'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Thread Area */}
      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-white dark:bg-[#121215] relative`}
           onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
           onDragLeave={() => setDragOver(false)}
           onDrop={handleDrop}>
        {dragOver && (
          <div className="absolute inset-0 z-20 bg-red-500/5 backdrop-blur-sm border-2 border-dashed border-red-500/40 flex items-center justify-center pointer-events-none">
            <div className="px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-red-500/20 text-center max-w-xs">
              <Paperclip className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Drop file to send</p>
              <p className="text-xs text-slate-400">Image · Video · Audio · PDF · ZIP · Doc</p>
            </div>
          </div>
        )}
        {activeContact ? (
          <>
            <div className="h-14 sm:h-16 px-3 sm:px-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button onClick={openContacts} className="md:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300" title="Back to contacts"><ArrowLeft className="w-5 h-5" /></button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-500/80 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">{activeContact.displayName?.charAt(0)}</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{activeContact.displayName}</h3>
                  <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">{activeContact.role}</span>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-6 space-y-4"
                 style={{
                   backgroundImage: `linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)`,
                   backgroundSize: '22px 22px',
                 }}>
              {loadingMessages ? <div className="py-12 text-center text-slate-400 text-xs">Loading thread...</div> : messages.length === 0 ? <div className="py-16 text-center text-slate-400 text-xs relative z-10 bg-white/70 dark:bg-[#121215]/70 backdrop-blur rounded-xl mx-auto max-w-sm border border-slate-200 dark:border-zinc-800">Say hi to {activeContact.displayName} to kick off your workout chat!<br/><span className="text-[11px]">Share images, videos, voice notes, PDFs or ZIP files.</span></div> : messages.map((m, idx) => {
                const isMe = (m.sender?.id && m.sender.id === user?.id) || (m.senderId && m.senderId === user?.id);
                return (
                  <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10`}>
                    <div className={`max-w-[82%] sm:max-w-[75%] relative`}>
                      <div className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm border ${isMe ? 'bg-red-600 text-white rounded-br-none border-red-600 shadow-md shadow-red-600/20' : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 rounded-bl-none border-slate-200 dark:border-zinc-700'}`}>
                        {m.content && <p className="leading-relaxed whitespace-pre-wrap break-words text-[0.8125rem]">{m.content}</p>}
                        {renderFile(m)}
                        <div className={`text-[9px] mt-1 flex items-center gap-1 ${isMe ? 'text-red-100 justify-end' : 'text-slate-400 justify-end'}`}>
                          <span>{m.sentAt ? new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* File preview bar */}
            {selectedFile && (
              <div className="mx-3 sm:mx-4 mb-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                {previewUrl ? <img src={previewUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover border shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">{selectedFile.type.startsWith('video/') ? <Video className="w-5 h-5" /> : selectedFile.type.startsWith('audio/') ? <Volume2 className="w-5 h-5" /> : selectedFile.name.endsWith('.zip') ? <FileArchive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}</div>}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400">{(selectedFile.size/1024).toFixed(1)} KB</p>
                </div>
                <button onClick={removeFile} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
            {isRecording && (
              <div className="mx-3 sm:mx-4 mb-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-xs font-bold">Recording {formatTime(recTime)}</span>
                <button onClick={stopRecording} className="ml-auto px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"><Square className="w-3 h-3" /> Stop</button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="sticky bottom-0 z-10 p-2 sm:p-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 shrink-0 bg-white dark:bg-[#121215]">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.mp3,.wav,.webm,.m4a,.ogg" />
              <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition shrink-0" title="Send photo"><ImageIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition shrink-0" title="Attach file"><Paperclip className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></button>
              {!isRecording ? (
                <button type="button" onClick={startRecording} className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 transition shrink-0" title="Voice message"><Mic className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></button>
              ) : (
                <button type="button" onClick={stopRecording} className="p-2 sm:p-2.5 rounded-xl bg-red-600 text-white animate-pulse shrink-0" title="Stop recording"><Square className="w-4 h-4" /></button>
              )}
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={selectedFile ? `Add a caption...` : `Message ${activeContact.displayName}...`} className="flex-1 min-w-0 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
              <button type="submit" disabled={!text.trim() && !selectedFile} className="p-2 sm:p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition shadow-lg shadow-red-600/20 shrink-0" title="Send"><Send className="w-[18px] h-[18px]" /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
            <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
            <span>No contacts available yet.</span>
          </div>
        )}
      </div>
    </div>
  );
};
