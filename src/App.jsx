import { useState, useEffect } from "react";
import { ref, onValue, runTransaction, set } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { db } from "./firebase";

const OPTIONS = [
  { key: "opt1", label: "Oui, sans hésiter" },
  { key: "opt2", label: "Non, ma vie privée n'a pas de prix" },
  { key: "opt3", label: "Oui, mais avec des limites strictes" },
];

export default function App() {
  const [votes, setVotes] = useState({ opt1: 0, opt2: 0, opt3: 0 });
  const [hasVoted, setHasVoted] = useState(
    localStorage.getItem("a_vote_he") === "true"
  );

  // Détecte si l'utilisateur vient du QR code (?mode=vote)
  const isVoteMode =
    new URLSearchParams(window.location.search).get("mode") === "vote";

  // Lien automatique encodé dans le QR code
  const voteUrl = `${window.location.origin}${window.location.pathname}?mode=vote`;

  // Écoute les votes en temps réel depuis Firebase
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

  // --- VUE TÉLÉPHONE (Écran affiché après le scan du QR Code) ---
  if (isVoteMode) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>
          Accepteriez-vous un suivi numérique de votre productivité pour +20 % de salaire ?
        </h2>
        {hasVoted ? (
          <div style={styles.card}>
            <h3 style={{ color: "#f5c542" }}>Vote enregistré !</h3>
            <p>Regardez l'écran du projecteur pour voir les résultats en direct.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "400px" }}>
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

  // --- VUE PROJECTEUR (Écran de ta présentation) ---
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Accepteriez-vous un suivi numérique de votre productivité pour +20 % de salaire ?
      </h1>

      <div style={styles.layout}>
        {/* Zone QR Code */}
        <div style={styles.qrBox}>
          <QRCodeSVG value={voteUrl} size={220} bgColor="#ffffff" fgColor="#0f172a" />
          <p style={{ color: "#0f172a", fontWeight: "bold", marginTop: "10px", marginBottom: 0 }}>
            Scannez pour voter ({totalVotes} votes)
          </p>
        </div>

        {/* Zone Graphique en direct */}
        <div style={styles.resultsBox}>
          {OPTIONS.map((opt) => {
            const count = votes[opt.key] || 0;
            const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return (
              <div key={opt.key} style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "1.1rem" }}>
                  <span>{opt.label}</span>
                  <strong style={{ color: "#f5c542" }}>{percent}% ({count})</strong>
                </div>
                <div style={styles.barBg}>
                  <div style={{ ...styles.barFill, width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton discret pour remettre à zéro après tes tests */}
      <button onClick={resetVotes} style={styles.resetBtn}>
        Réinitialiser les votes
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    color: "#ffffff",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    textAlign: "center",
  },
  title: { maxWidth: "800px", marginBottom: "40px", lineHeight: 1.3 },
  layout: {
    display: "flex",
    flexWrap: "wrap",
    gap: "50px",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1000px",
  },
  qrBox: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  resultsBox: { flex: 1, minWidth: "300px", textAlign: "left" },
  barBg: {
    width: "100%",
    height: "24px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#f5c542",
    transition: "width 0.4s ease-out",
  },
  button: {
    padding: "18px",
    fontSize: "1.05rem",
    fontWeight: "bold",
    borderRadius: "12px",
    border: "2px solid #f5c542",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #f5c542",
  },
  resetBtn: {
    marginTop: "50px",
    background: "transparent",
    color: "#64748b",
    border: "1px solid #334155",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};