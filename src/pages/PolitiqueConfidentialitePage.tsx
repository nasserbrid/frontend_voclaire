import { Link } from 'react-router-dom'

export default function PolitiqueConfidentialitePage() {
  const h2 = { fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '18px', color: '#f9fafb', margin: '0 0 12px' } as const
  const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginTop: '12px', fontSize: '13.5px' }
  const thStyle = { textAlign: 'left' as const, padding: '10px 14px', fontWeight: 600, color: '#9ca3af', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' }
  const tdStyle = { padding: '10px 14px', color: '#d1d5db', borderBottom: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top' as const, lineHeight: 1.6 }

  return (
    <div style={{ background: '#030712', color: '#d1d5db', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/" style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '40px' }}>
          ← Accueil
        </Link>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', color: '#34d399', margin: '0 0 8px' }}>
          Politique de confidentialité
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '48px' }}>Dernière mise à jour : 30 juin 2026</p>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>1. Responsable du traitement</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Nasser MOHAMED SAID — SIRET 90310857900025 —{' '}
            <a href="mailto:nasserbrid@gmail.com" style={{ color: '#34d399', textDecoration: 'none' }}>nasserbrid@gmail.com</a>
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>2. Données collectées</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li><strong style={{ color: '#f9fafb' }}>Compte</strong> : adresse email, prénom (via Google OAuth)</li>
            <li><strong style={{ color: '#f9fafb' }}>Fichiers audio</strong> : traités pour transcription, stockés sur Cloudflare R2 (Europe occidentale). Supprimés à la demande.</li>
            <li><strong style={{ color: '#f9fafb' }}>Transcriptions</strong> : texte généré, nom de fichier, durée, date de création</li>
            <li><strong style={{ color: '#f9fafb' }}>Paiement</strong> : géré intégralement par Stripe. Aucune donnée bancaire n'est stockée par voclaire.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>3. Finalités et bases légales</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Traitement</th>
                <th style={thStyle}>Base légale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>Fourniture du service (transcription, LLM)</td>
                <td style={tdStyle}>Exécution du contrat</td>
              </tr>
              <tr>
                <td style={tdStyle}>Gestion des abonnements Pro</td>
                <td style={tdStyle}>Exécution du contrat</td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, borderBottom: 'none' }}>Preuve d'acceptation des CGU</td>
                <td style={{ ...tdStyle, borderBottom: 'none' }}>Obligation légale (RGPD)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>4. Durée de conservation</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li>Compte actif : données conservées pendant toute la durée du compte</li>
            <li>Après suppression du compte : purge technique sous 30 jours</li>
            <li>Données de facturation (Stripe) : 10 ans (obligation légale comptable)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>5. Sous-traitants</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Prestataire</th>
                <th style={thStyle}>Rôle</th>
                <th style={thStyle}>Localisation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}><strong style={{ color: '#f9fafb' }}>MongoDB Atlas</strong></td>
                <td style={tdStyle}>Base de données</td>
                <td style={tdStyle}>AWS Paris, eu-west-3 (UE)</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong style={{ color: '#f9fafb' }}>Cloudflare R2</strong></td>
                <td style={tdStyle}>Stockage audio</td>
                <td style={tdStyle}>Europe occidentale (UE)</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong style={{ color: '#f9fafb' }}>OpenAI</strong></td>
                <td style={tdStyle}>Traitement LLM</td>
                <td style={tdStyle}>États-Unis (clauses contractuelles types UE)</td>
              </tr>
              <tr>
                <td style={tdStyle}><strong style={{ color: '#f9fafb' }}>Stripe</strong></td>
                <td style={tdStyle}>Paiement</td>
                <td style={tdStyle}>États-Unis (certifié PCI DSS, clauses types UE)</td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, borderBottom: 'none' }}><strong style={{ color: '#f9fafb' }}>OVH</strong></td>
                <td style={{ ...tdStyle, borderBottom: 'none' }}>Hébergement serveur</td>
                <td style={{ ...tdStyle, borderBottom: 'none' }}>Roubaix, France (UE)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>6. Vos droits (RGPD art. 15-22)</h2>
          <p style={{ lineHeight: 1.7, margin: '0 0 12px' }}>
            Vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité, d'opposition et de limitation du traitement.
          </p>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Pour exercer vos droits :{' '}
            <a href="mailto:nasserbrid@gmail.com" style={{ color: '#34d399', textDecoration: 'none' }}>nasserbrid@gmail.com</a>
            {' '}(réponse sous 30 jours). Réclamation possible auprès de la CNIL : www.cnil.fr
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>7. Cookies</h2>
          <p style={{ lineHeight: 1.7, margin: '0 0 8px' }}>Aucun cookie publicitaire ou de tracking.</p>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Seul un cookie de session HttpOnly (authentification JWT) est utilisé, strictement nécessaire au fonctionnement du service.
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
