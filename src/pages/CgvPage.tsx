import { Link } from 'react-router-dom'

export default function CgvPage() {
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
          Conditions Générales de Vente
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '48px' }}>Dernière mise à jour : 30 juin 2026</p>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>1. Vendeur</h2>
          <p style={{ lineHeight: 1.7, margin: '0 0 4px' }}>Nasser MOHAMED SAID — Entrepreneur individuel</p>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            SIRET : 90310857900025 —{' '}
            <a href="mailto:nasserbrid@gmail.com" style={{ color: '#34d399', textDecoration: 'none' }}>nasserbrid@gmail.com</a>
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>2. Produits et prix</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Offre</th>
                <th style={thStyle}>Prix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>Plan Pro mensuel</td>
                <td style={tdStyle}>9,99 € / mois</td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, borderBottom: 'none' }}>Plan Pro annuel</td>
                <td style={{ ...tdStyle, borderBottom: 'none' }}>95,88 € / an (soit 7,99 €/mois)</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>Prix TTC. TVA non applicable, art. 293 B du CGI.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>3. Commande</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            En cliquant sur "Souscrire", l'utilisateur passe une commande ferme et définitive d'abonnement au Plan Pro.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>4. Paiement</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Paiement par carte bancaire via Stripe (plateforme sécurisée, certifiée PCI DSS). Le prélèvement est automatique à chaque échéance (mensuelle ou annuelle).
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>5. Reconduction automatique</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            L'abonnement est automatiquement reconduit à chaque échéance jusqu'à résiliation.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>6. Résiliation</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li>L'utilisateur peut résilier à tout moment depuis l'Espace Client accessible dans l'application (section "Gérer l'abonnement").</li>
            <li>La résiliation prend effet à la fin de la période en cours. Aucun remboursement au prorata ne sera effectué.</li>
            <li>À l'échéance, le compte repasse automatiquement en Plan Free.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>7. Droit de rétractation</h2>
          <p style={{ lineHeight: 1.7, margin: '0 0 12px' }}>
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation de 14 jours ne s'applique pas aux contenus numériques dont l'exécution a commencé avec l'accord exprès du consommateur avant l'expiration du délai.
          </p>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            En accédant immédiatement au service Pro après votre paiement, vous reconnaissez expressément renoncer à votre droit de rétractation. Cette renonciation est confirmée par la case cochée lors de l'abonnement.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>8. Remboursements</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Aucun remboursement sauf défaut du service imputable à voclaire ou obligation légale imposant le remboursement.
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>9. Litiges</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, margin: 0 }}>
            <li>Résolution amiable privilégiée : <a href="mailto:nasserbrid@gmail.com" style={{ color: '#34d399', textDecoration: 'none' }}>nasserbrid@gmail.com</a></li>
            <li>Médiation : plateforme européenne de règlement en ligne des litiges (ec.europa.eu/consumers/odr)</li>
            <li>À défaut d'accord amiable, les tribunaux français sont compétents.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={h2}>10. Droit applicable</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Les présentes CGV sont régies par le droit français.
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
