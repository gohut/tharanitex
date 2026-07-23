"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Image } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import Toggle from "../../../components/ui/Toggle";
import { banners as initBanners, articles as initArticles } from "../../../data/cms";

export default function ContentPage() {
  const [banners, setBanners] = useState(initBanners);
  const [articles, setArticles] = useState(initArticles);
  const [tab, setTab] = useState("banners");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const openAddBanner = () => { setForm({ title:"", subtitle:"", link:"", active:true, priority:banners.length+1 }); setModal("addBanner"); };
  const openEditBanner = (b) => { setForm({...b}); setSelected(b); setModal("editBanner"); };
  const saveBanner = () => {
    if (modal === "addBanner") setBanners([...banners, { id:`BN${Date.now()}`, ...form, image:"https://placehold.co/400x200/145C3E/D4AF37?text=New+Banner" }]);
    else setBanners(banners.map((b) => b.id === selected.id ? {...b,...form} : b));
    setModal(null);
  };
  const toggleBanner = (id) => setBanners(banners.map((b) => b.id === id ? {...b, active: !b.active} : b));
  const deleteBanner = (id) => setBanners(banners.filter((b) => b.id !== id));

  const openAddArticle = () => { setForm({ title:"", author:"", content:"", status:"Draft", tags:"" }); setModal("addArticle"); };
  const openEditArticle = (a) => { setForm({...a, tags: a.tags.join(", ")}); setSelected(a); setModal("editArticle"); };
  const saveArticle = () => {
    const tags = (form.tags||"")
      .split(",").map((t) => t.trim()).filter(Boolean);
    if (modal === "addArticle") setArticles([...articles, { id:`ART${Date.now()}`, ...form, tags, date: new Date().toISOString().slice(0,10), cover:"https://placehold.co/400x200/145C3E/D4AF37?text=New+Article" }]);
    else setArticles(articles.map((a) => a.id === selected.id ? {...a,...form,tags} : a));
    setModal(null);
  };
  const deleteArticle = (id) => setArticles(articles.filter((a) => a.id !== id));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Content Management</h1>
        <p className="text-green-400 text-sm mt-0.5">Manage banners, articles, and homepage content</p>
      </div>

      <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit">
        {["banners","articles"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
            }`}>{t === "banners" ? "Homepage Banners" : "Blog / Articles"}</button>
        ))}
      </div>

      {/* Banners */}
      {tab === "banners" && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={openAddBanner}><Plus size={14} /> Add Banner</Button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="bg-green-900 border border-green-800 rounded-2xl overflow-hidden shadow-card">
                <div className="relative">
                  <img src={b.image} alt={b.title} className="w-full h-36 object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button onClick={() => toggleBanner(b.id)} className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors">
                      {b.active ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={() => openEditBanner(b)} className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => deleteBanner(b.id)} className="p-1.5 rounded-lg bg-red-900/80 hover:bg-red-700 text-white transition-colors"><Trash2 size={13} /></button>
                  </div>
                  {!b.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">Inactive</span></div>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{b.title}</p>
                      <p className="text-green-400 text-xs mt-0.5">{b.subtitle}</p>
                    </div>
                    <span className="text-green-500 text-xs">#{b.priority}</span>
                  </div>
                  <Toggle checked={b.active} onChange={() => toggleBanner(b.id)} label={b.active ? "Active" : "Inactive"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      {tab === "articles" && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={openAddArticle}><Plus size={14} /> New Article</Button></div>
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="bg-green-900 border border-green-800 rounded-2xl p-4 shadow-card flex flex-wrap gap-4 items-center">
                <img src={a.cover} alt={a.title} className="w-20 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{a.title}</p>
                  <p className="text-green-400 text-xs">{a.author} · {a.date}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {a.tags.map((t) => <span key={t} className="px-1.5 py-0.5 bg-green-800 text-green-400 text-[10px] rounded-full border border-green-700">{t}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <button onClick={() => openEditArticle(a)} className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => deleteArticle(a.id)} className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner Modal */}
      <Modal open={modal==="addBanner"||modal==="editBanner"} onClose={() => setModal(null)} title={modal==="addBanner" ? "Add Banner" : "Edit Banner"} size="md">
        <div className="space-y-4">
          <FormInput label="Title" id="btitle" value={form.title||""} onChange={(e) => setForm({...form,title:e.target.value})} />
          <FormInput label="Subtitle" id="bsubtitle" value={form.subtitle||""} onChange={(e) => setForm({...form,subtitle:e.target.value})} />
          <FormInput label="Link URL" id="blink" value={form.link||""} onChange={(e) => setForm({...form,link:e.target.value})} />
          <FormInput label="Priority" id="bpriority" type="number" value={form.priority||""} onChange={(e) => setForm({...form,priority:Number(e.target.value)})} />
          <Toggle checked={!!form.active} onChange={(v) => setForm({...form,active:v})} label="Active" />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={saveBanner}>Save Banner</Button>
        </div>
      </Modal>

      {/* Article Modal */}
      <Modal open={modal==="addArticle"||modal==="editArticle"} onClose={() => setModal(null)} title={modal==="addArticle" ? "New Article" : "Edit Article"} size="lg">
        <div className="space-y-4">
          <FormInput label="Title" id="atitle" value={form.title||""} onChange={(e) => setForm({...form,title:e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Author" id="aauthor" value={form.author||""} onChange={(e) => setForm({...form,author:e.target.value})} />
            <FormInput label="Status" id="astatus" type="select" value={form.status||"Draft"} onChange={(e) => setForm({...form,status:e.target.value})} options={["Draft","Published"]} />
          </div>
          <FormInput label="Tags (comma separated)" id="atags" value={form.tags||""} onChange={(e) => setForm({...form,tags:e.target.value})} placeholder="style, guide, tips" />
          <FormInput label="Content" id="acontent" type="textarea" value={form.content||""} onChange={(e) => setForm({...form,content:e.target.value})} rows={6} placeholder="Write your article content here..." />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={saveArticle}>Save Article</Button>
        </div>
      </Modal>
    </div>
  );
}