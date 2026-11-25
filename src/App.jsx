import { useState, useEffect } from "react";
import { ref, onValue, runTransaction, set } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { db } from "./firebase";

const OPTIONS = [
  { key: "opt1", label: "Oui, sans hésiter" },
  { key: "opt2", label: "Non, ma vie privée n'a pas de prix" },
  { key: "opt3", label: "Oui, avec des limites strictes" },
];

export default function App() {
  const [votes, setVotes] = useState({ opt1: 0, opt2: 0, opt3: 0 });
  const [hasVoted, setHasVoted] = useState(
    localStorage.getItem("a_vote_he") === "true"
  );

  const isVoteMode =
    new URLSearchParams(window.location.search).get("mode") === "vote";
  const voteUrl = `${window.location.origin}${window.location.pathname}?mode=vote`;

  useEffect(() => {
    const votesRef = ref(db, "votes");
    return onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVotes({
          opt1: data.opt1 || 0,
          opt2: data.opt2 || 0,
          opt3: data.opt3 || 0,
        });
      }
    });
  }, []);

  const handleVote = (key) => {
    if (hasVoted) return;
    const voteRef = ref(db, `votes/${key}`);
    runTransaction(voteRef, (val) => (val || 0) + 1);
    localStorage.setItem("a_vote_he", "true");
    setHasVoted(true);
  };

  const resetVotes = () => {
    set(ref(db, "votes"), { opt1: 0, opt2: 0, opt3: 0 });
    localStorage.removeItem("a_vote_he");
    setHasVoted(false);
  };

  const totalVotes = votes.opt1 + votes.opt2 + votes.opt3;

  // --- VUE TÉLÉPHONE ---
  if (isVoteMode) {
    return (
      <div style={styles.phoneContainer}>
        <h2 style={{ color: "#ffffff", fontSize: "1.25rem", marginBottom: "24px", lineHeight: 1.4 }}>
          Accepteriez-vous un suivi numérique de votre productivité pour +20 % de salaire ?
        </h2>
        {hasVoted ? (
          <div style={styles.card}>
            <h3 style={{ color: "#f5c542", marginTop: 0 }}>Vote enregistré !</h3>
            <p style={{ color: "#e2e8f0", marginBottom: 0 }}>
              Regardez l'écran de présentation pour voir les résultats en direct.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "380px" }}>
            {OPTIONS.map((opt) => (
              <button key={opt.key} onClick={() => handleVote(opt.key)} style={styles.button}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VUE PROJECTEUR COMPACTE (POUR GAMMA) ---
  return (
    <div style={styles.embedContainer}>
      <button onClick={resetVotes} style={styles.resetBtn} title="Remettre à zéro">
        ↺ Reset
      </button>

      {/* QR Code */}
      <div style={styles.qrBox}>
        <QRCodeSVG value={voteUrl} size={145} bgColor="#ffffff" fgColor="#0f172a" />
        <p style={{ color: "#0f172a", fontWeight: "700", fontSize: "0.85rem", margin: "8px 0 0 0" }}>
          Scannez ({totalVotes} {totalVotes > 1 ? "votes" : "vote"})
        </p>
      </div>

      {/* Barres de résultats */}
      <div style={styles.resultsBox}>
        {OPTIONS.map((opt) => {
          const count = votes[opt.key] || 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div key={opt.key} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.92rem", color: "#ffffff" }}>
                <span>{opt.label}</span>
                <strong style={{ color: "#f5c542", marginLeft: "8px" }}>{percent}% ({count})</strong>
              </div>
              <div style={styles.barBg}>
                <div style={{ ...styles.barFill, width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  embedContainer: {
    position: "relative",
    minHeight: "100vh",
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    padding: "20px 24px",
  },
  phoneContainer: {
    minHeight: "100vh",
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
  },
  qrBox: {
    backgroundColor: "#ffffff",
    padding: "12px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
  },
  resultsBox: {
    width: "100%",
    maxWidth: "360px",
  },
  barBg: {
    width: "100%",
    height: "14px",
    backgroundColor: "#1e293b",
    borderRadius: "999px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#f5c542",
    transition: "width 0.4s ease-out",
  },
  button: {
    padding: "16px",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "12px",
    border: "2px solid #f5c542",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #f5c542",
  },
  resetBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(255,255,255,0.08)",
    color: "#94a3b8",
    border: "none",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
};