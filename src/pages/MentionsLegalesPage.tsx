import { Link } from 'react-router-dom'

export default function MentionsLegalesPage() {
  return (
    <div style={{ background: '#030712', color: '#d1d5db', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/" style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '40px' }}>
          ← Accueil
        </Link>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', color: '#34d399', margin: '0 0 8px' }}>
          Mentions légales
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '48px' }}>Dernière mise à jour : 30 juin 2026</p>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '18px', color: '#f9fafb', margin: '0 0 12px' }}>Éditeur du site</h2>
          <p style={{ lineHeight: 1.7, margin: '0 0 4px' }}>Nasser MOHAMED SAID</p>
          <p style={{ lineHeight: 1.7, margin: '0 0 4px' }}>Entrepreneur individuel</p>
          <p style={{ lineHeight: 1.7, margin: '0 0 4px' }}>SIRET : 90310857900025</p>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            Email :{' '}
            <a href="mailto:nasserbrid@gmail.com" style={{ color: '#34d399', textDecoration: 'none' }}>nasserbrid@gmail.com</a>
          </p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '18px', color: '#f9fafb', margin: '0 0 12px' }}>Hébergeur</h2>
          <p style={{ lineHeight: 1.7, margin: '0 0 4px' }}>OVH SAS</p>
          <p style={{ lineHeight: 1.7, margin: '0 0 4px' }}>2 rue Kellermann, 59100 Roubaix, France</p>
          <p style={{ lineHeight: 1.7, margin: 0 }}>Téléphone : +33 9 72 10 10 07</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '18px', color: '#f9fafb', margin: '0 0 12px' }}>Directeur de la publication</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>Nasser MOHAMED SAID</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '18px', color: '#f9fafb', margin: '0 0 12px' }}>Propriété intellectuelle</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>
            L'ensemble des contenus présents sur voclaire (textes, interface, code) est la propriété exclusive de Nasser MOHAMED SAID. Toute reproduction sans autorisation écrite préalable est interdite.
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
