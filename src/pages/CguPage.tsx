import { Link } from 'react-router-dom'

export default function CguPage() {
  const h2 = { fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '18px', color: '#f9fafb', margin: '0 0 12px' } as const

  return (
    <div style={{ background: '#030712', color: '#d1d5db', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/" style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '40px' }}>
          ← Accueil
        </Link>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', color: '#34d399', margin: '0 0 8px' }}>
          Conditions Générales d'Utilisation
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '48px' }}>Dernière mise à jour : 30 juin 2026</p>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>1. Objet</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            voclaire est un service de transcription audio (Speech-to-Text) proposé par Nasser MOHAMED SAID (SIRET 90310857900025). Ces CGU régissent l'utilisation du service par tout utilisateur inscrit.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>2. Plans d'accès</h2>
          <p style={{ fontWeight: 600, color: '#f9fafb', margin: '0 0 6px' }}>Plan Free (0 €/mois)</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: '0 0 16px' }}>
            <li>Transcription audio (fichiers jusqu'à 60 min/mois cumulés)</li>
            <li>10 améliorations LLM/mois (correction, reformulation, résumé)</li>
            <li>Export DOCX (texte brut)</li>
          </ul>
          <p style={{ fontWeight: 600, color: '#f9fafb', margin: '0 0 6px' }}>Plan Pro (9,99 €/mois ou 95,88 €/an)</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li>Transcription illimitée sans quota mensuel</li>
            <li>Améliorations LLM illimitées</li>
            <li>Modèle Whisper fine-tuné sur le français</li>
            <li>Export DOCX / PDF / PPTX structurés (titre, introduction, points clés, conclusion)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>3. Création de compte</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            L'utilisateur s'engage à fournir des informations exactes et à jour. Un seul compte par personne physique est autorisé.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>4. Obligations de l'utilisateur</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li>Ne pas transmettre de fichiers audio contenant des données personnelles de tiers sans leur consentement explicite.</li>
            <li>Ne pas tenter de contourner les quotas, de scraper l'API ou d'en faire un usage abusif.</li>
            <li>Ne pas utiliser le service à des fins illicites ou contraires à l'ordre public.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>5. Propriété intellectuelle</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li>Le service voclaire, son interface et son code source sont propriété de Nasser MOHAMED SAID.</li>
            <li>Les transcriptions et textes générés appartiennent à l'utilisateur qui a soumis le fichier audio.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>6. Disponibilité du service</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            voclaire s'engage à assurer la disponibilité du service sans garantir une disponibilité 100 % (maintenance, incidents techniques). Aucune compensation ne sera due pour une indisponibilité temporaire.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>7. Suspension de compte</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            En cas de violation des présentes CGU, voclaire se réserve le droit de suspendre ou supprimer le compte sans préavis.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>8. Modification des CGU</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Toute modification substantielle sera notifiée par email avec un préavis de 30 jours. L'utilisation continue du service après la modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>9. Droit applicable</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français sont compétents.
          </p>
        </section>

        <footer style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6b7280' }}>
          <Link to="/mentions-legales" style={{ color: '#6b7280', textDecoration: 'none' }}>Mentions légales</Link>
          <span>·</span>
          <Link to="/politique-de-confidentialite" style={{ color: '#6b7280', textDecoration: 'none' }}>Politique de confidentialité</Link>
          <span>·</span>
          <Link to="/cgu" style={{ color: '#6b7280', textDecoration: 'none' }}>CGU</Link>
          <span>·</span>
          <Link to="/cgv" style={{ color: '#6b7280', textDecoration: 'none' }}>CGV</Link>
        </footer>
      </div>
    </div>
  )
}
