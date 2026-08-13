"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { scamSeedData } from "@/data/scams";
import { getCollections, getSavedScamIds, setCollections, setSavedScamIds } from "@/lib/community";

interface CollectionItem {
  id: string;
  name: string;
  scamIds: string[];
  updatedAt: string;
}

export default function CommunityLibraryPage() {
  const [savedScams, setSavedScamsState] = useState<string[]>([]);
  const [collections, setCollectionsState] = useState<CollectionItem[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");

  useEffect(() => {
    const saved = getSavedScamIds();
    const currentCollections = getCollections();
    setSavedScamsState(saved);
    setCollectionsState(currentCollections);
  }, []);

  const savedScamDetails = useMemo(
    () => scamSeedData.filter((scam) => savedScams.includes(scam.id)),
    [savedScams],
  );

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const next = [{
      id: `collection-${Date.now()}`,
      name: newCollectionName.trim(),
      scamIds: [],
      updatedAt: new Date().toISOString(),
    }, ...collections];
    setCollectionsState(next);
    setCollections(next);
    setNewCollectionName("");
  };

  const renameCollection = (id: string) => {
    const target = collections.find((item) => item.id === id);
    if (!target) return;
    const nextName = window.prompt("Rename collection", target.name);
    if (!nextName || !nextName.trim()) return;
    const next = collections.map((item) => item.id === id ? { ...item, name: nextName.trim(), updatedAt: new Date().toISOString() } : item);
    setCollectionsState(next);
    setCollections(next);
  };

  const deleteCollection = (id: string) => {
    const next = collections.filter((item) => item.id !== id);
    setCollectionsState(next);
    setCollections(next);
  };

  const addScamToCollection = (collectionId: string, scamId: string) => {
    const next = collections.map((collection) => {
      if (collection.id !== collectionId) return collection;
      const current = new Set(collection.scamIds);
      if (current.has(scamId)) current.delete(scamId); else current.add(scamId);
      return { ...collection, scamIds: [...current], updatedAt: new Date().toISOString() };
    });
    setCollectionsState(next);
    setCollections(next);
  };

  const removeScamFromCollection = (collectionId: string, scamId: string) => {
    addScamToCollection(collectionId, scamId);
  };

  const clearSavedScams = () => {
    setSavedScamsState([]);
    setSavedScamIds([]);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#1d4ed8" }}>Saved content</div>
        <h1 style={{ margin: 0, fontSize: 32 }}>My Library</h1>
      </div>

      <section style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid rgba(148,163,184,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Saved Scams</h2>
          <button onClick={clearSavedScams} style={{ background: "#f8fafc", color: "#334155", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}>
            Clear All
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {savedScamDetails.length ? savedScamDetails.map((scam) => (
            <div key={scam.id} style={{ background: "#f8fafc", borderRadius: 18, padding: 14, border: "1px solid rgba(148,163,184,0.18)" }}>
              <div style={{ height: 90, borderRadius: 12, background: scam.image, marginBottom: 10 }} />
              <div style={{ fontWeight: 800 }}>{scam.title}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>{scam.category}</div>
            </div>
          )) : <div style={{ color: "#64748b" }}>No scam saved yet.</div>}
        </div>
      </section>

      <section style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid rgba(148,163,184,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Collections</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Create collection" style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, padding: "10px 12px", minWidth: 180 }} />
            <button onClick={handleCreateCollection} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1d4ed8", color: "#fff", border: 0, borderRadius: 12, padding: "10px 12px", fontWeight: 800, cursor: "pointer" }}>
              <FolderPlus size={16} /> Create Collection
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {collections.map((collection) => (
            <div key={collection.id} style={{ background: "#f8fafc", borderRadius: 18, padding: 16, border: "1px solid rgba(148,163,184,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{collection.name}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => renameCollection(collection.id)} style={miniButton}>Rename</button>
                  <button onClick={() => deleteCollection(collection.id)} style={{ ...miniButton, color: "#b91c1c" }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ color: "#64748b", marginTop: 12 }}>
                {collection.scamIds.length} Scams • Last updated {new Date(collection.updatedAt).toLocaleDateString()}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {savedScamDetails.length ? savedScamDetails.map((scam) => (
                  <button
                    key={`${collection.id}-${scam.id}`}
                    onClick={() => addScamToCollection(collection.id, scam.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: collection.scamIds.includes(scam.id) ? "1px solid #1d4ed8" : "1px solid rgba(148,163,184,0.18)",
                      background: collection.scamIds.includes(scam.id) ? "#dbeafe" : "#fff",
                      color: collection.scamIds.includes(scam.id) ? "#1d4ed8" : "#334155",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {scam.title}
                  </button>
                )) : <span style={{ color: "#64748b" }}>Save scams to add them here.</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const miniButton: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.2)",
  background: "#fff",
  color: "#334155",
  borderRadius: 10,
  padding: "7px 10px",
  fontWeight: 700,
  cursor: "pointer",
};
