import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { transcribeAudio } from '../api/stt'

const steps = [
  { num: '01', title: 'Déposez votre audio', body: 'Glissez un fichier MP3, WAV ou M4A. Aucun compte, aucune installation.' },
  { num: '02', title: "L'IA transcrit", body: 'Le modèle Whisper convertit la parole en texte avec une grande précision, en français.' },
  { num: '03', title: 'Récupérez le texte', body: "Copiez, exportez, ou affinez le résultat avec le post-traitement IA." },
]

const freeFeatures = [
  'Transcription audio illimitée en test',
  'Modèle Whisper haute précision',
  'Détection automatique de la langue',
  'Copier / coller instantané',
]

const proFeatures = [
  'Correction de la ponctuation et des fautes',
  'Reformulation et structuration du texte',
  "Résumé automatique de l'enregistrement",
  'Export en plusieurs formats : Word, PowerPoint, PDF',
  'Historique et sauvegarde des transcriptions',
]

const freePlan = ["Transcription IA", "Fichiers jusqu'à 25 Mo", 'Export texte brut']
const proPlan = ['Tout du plan Free', 'Post-traitement IA (correction, reformulation)', 'Fichiers longue durée', 'Historique illimité & sauvegarde']

export default function LandingPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [meta, setMeta] = useState('')

  function scrollToDemo(e: React.MouseEvent) {
    e.preventDefault()
    const el = document.getElementById('demo')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' })
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setError(''); setResult('') }
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true) }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); setDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('audio')) { setFile(f); setError(''); setResult('') }
    else setError('Merci de déposer un fichier audio.')
  }

  async function onTranscribe() {
    if (!file || loading) return
    setLoading(true); setError(''); setResult('')
    const t0 = Date.now()
    try {
      const text = await transcribeAudio(file)
      setResult(text)
      setMeta(((Date.now() - t0) / 1000).toFixed(1) + 's')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la transcription')
    } finally {
      setLoading(false)
    }
  }

  function onCopy() {
    if (result && navigator.clipboard) navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{ background: '#030712', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>

      {/* ambient glow */}
      <div style={{ position: 'absolute', top: '-220px', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.22), transparent 60%)', pointerEvents: 'none', filter: 'blur(20px)', zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', background: 'rgba(3,7,18,0.72)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(140deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <div style={{ width: '8px', height: '14px', background: '#fff', borderRadius: '4px' }} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: '#fff' }}>voclaire</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14.5px', fontWeight: 500 }}>Tarifs</a>
            <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14.5px', fontWeight: 500 }}>Se connecter</Link>
            <Link to="/register" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '880px', margin: '0 auto', padding: '96px 24px 60px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '60px', lineHeight: 1.04, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 22px' }}>
          Votre audio en texte,<br />
          <span style={{ background: 'linear-gradient(120deg,#34d399,#10b981)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en quelques secondes.</span>
        </h1>
        <p style={{ fontSize: '19px', lineHeight: 1.6, color: '#9ca3af', maxWidth: '560px', margin: '0 auto 38px', fontWeight: 500 }}>
          Déposez un fichier audio, obtenez une transcription précise instantanément. Sans compte, sans installation. Corrigez et reformulez ensuite avec l'IA.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#demo" onClick={scrollToDemo} style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '15px 30px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 28px rgba(16,185,129,0.45)', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
            Essayer maintenant <span style={{ fontSize: '18px', lineHeight: 1 }}>↓</span>
          </a>
          <a href="#pricing" style={{ color: '#e5e7eb', textDecoration: 'none', padding: '15px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)' }}>Voir les tarifs</a>
        </div>
        <p style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '22px', fontWeight: 500 }}>Aucune carte bancaire requise · Premier essai gratuit en bas de page</p>
      </section>

      {/* DEMO */}
      <section id="demo" style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '40px 24px 90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '12px' }}>Démo en direct</div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Testez-le tout de suite</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Déposez un fichier audio. La transcription s'affiche ici même.</p>
        </div>

        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

          {/* dropzone */}
          <label htmlFor="vc-file" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            style={{ display: 'block', textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: `1.5px dashed ${dragging ? '#34d399' : 'rgba(16,185,129,0.4)'}`, background: dragging ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <input id="vc-file" type="file" accept="audio/*" onChange={onFileChange} style={{ display: 'none' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
                {[8, 16, 11, 18, 7].map((h, i) => (
                  <span key={i} style={{ width: '3px', height: `${h}px`, background: '#34d399', borderRadius: '2px', display: 'block' }} />
                ))}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '5px' }}>
              {file ? file.name : (dragging ? 'Déposez le fichier ici' : 'Déposez un fichier audio')}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
              {file ? `${Math.round(file.size / 1024)} Ko · prêt à transcrire` : 'ou cliquez pour parcourir · MP3, WAV, M4A…'}
            </div>
          </label>

          <button onClick={onTranscribe} disabled={!file || loading}
            style={{ marginTop: '18px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px', borderRadius: '13px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '16px', fontWeight: 700, cursor: (!file || loading) ? 'not-allowed' : 'pointer', background: (!file || loading) ? 'rgba(16,185,129,0.4)' : '#10b981', color: '#fff', transition: 'background 0.2s', boxShadow: (!file || loading) ? 'none' : '0 8px 24px rgba(16,185,129,0.4)' }}>
            {loading && (
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
            )}
            {loading ? 'Transcription en cours…' : 'Transcrire'}
          </button>

          {error && (
            <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>{error}</div>
          )}

          {result && (
            <div style={{ marginTop: '22px', animation: 'vc-fadeup 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#22c55e', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.02em' }}>Transcription</span>
                  {meta && <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>· {meta}</span>}
                </div>
                <button onClick={onCopy} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  {copied ? 'Copié ✓' : 'Copier'}
                </button>
              </div>
              <div style={{ background: '#05070f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', fontSize: '15.5px', lineHeight: 1.7, color: '#d1d5db', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{result}</div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#fff', marginBottom: '2px' }}>
                    Affiner avec l'IA{' '}
                    <span style={{ fontSize: '11px', background: '#10b981', color: '#fff', padding: '2px 7px', borderRadius: '6px', verticalAlign: 'middle', marginLeft: '4px' }}>Pro</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#9ca3af', fontWeight: 500 }}>Corrigez la ponctuation, reformulez, structurez automatiquement.</div>
                </div>
                <a href="#cta" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>Débloquer</a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Comment ça marche</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Trois étapes, zéro friction.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {steps.map(step => (
            <div key={step.num} style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.03),transparent)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '28px 24px' }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 700, color: '#10b981', marginBottom: '18px' }}>{step.num}</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '19px', color: '#fff', marginBottom: '8px' }}>{step.title}</div>
              <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#9ca3af', fontWeight: 500 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Gratuit vs Pro</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Commencez gratuitement. Passez au niveau supérieur quand vous en avez besoin.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px' }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '6px' }}>Transcription</div>
            <div style={{ fontSize: '13.5px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '22px' }}>Gratuit</div>
            {freeFeatures.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#22c55e', fontSize: '15px', marginTop: '1px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#d1d5db', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(180deg,rgba(16,185,129,0.14),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '20px', padding: '30px' }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '6px' }}>Post-traitement IA</div>
            <div style={{ fontSize: '13.5px', color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '22px' }}>Pro</div>
            {proFeatures.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', padding: '9px 0', borderTop: '1px solid rgba(16,185,129,0.18)' }}>
                <span style={{ color: '#34d399', fontSize: '15px', marginTop: '1px' }}>✦</span>
                <span style={{ fontSize: '15px', color: '#d1fae5', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, maxWidth: '920px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Tarifs simples</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Sans engagement. Annulez à tout moment.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '34px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '21px', color: '#fff' }}>Free</div>
            <div style={{ margin: '18px 0 6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '46px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>0€</span>
              <span style={{ color: '#9ca3af', fontSize: '15px', fontWeight: 600 }}>/ pour toujours</span>
            </div>
            <div style={{ fontSize: '14.5px', color: '#9ca3af', marginBottom: '24px', fontWeight: 500 }}>Pour transcrire ponctuellement.</div>
            <div style={{ flex: 1 }}>
              {freePlan.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0' }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  <span style={{ fontSize: '14.5px', color: '#d1d5db', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="#cta" style={{ marginTop: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', display: 'block' }}>Commencer gratuitement</a>
          </div>
          <div style={{ background: 'linear-gradient(180deg,rgba(16,185,129,0.16),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.45)', borderRadius: '22px', padding: '34px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 50px rgba(16,185,129,0.18)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '34px', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', letterSpacing: '0.03em' }}>Populaire</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '21px', color: '#fff' }}>Pro</div>
            <div style={{ margin: '18px 0 6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '46px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>12€</span>
              <span style={{ color: '#6ee7b7', fontSize: '15px', fontWeight: 600 }}>/ mois</span>
            </div>
            <div style={{ fontSize: '14.5px', color: '#6ee7b7', marginBottom: '24px', fontWeight: 500 }}>Pour transcrire et affiner au quotidien.</div>
            <div style={{ flex: 1 }}>
              {proPlan.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0' }}>
                  <span style={{ color: '#34d399' }}>✦</span>
                  <span style={{ fontSize: '14.5px', color: '#d1fae5', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="#cta" style={{ marginTop: '24px', textAlign: 'center', background: '#10b981', color: '#fff', textDecoration: 'none', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', boxShadow: '0 8px 24px rgba(16,185,129,0.4)', display: 'block' }}>Passer au Pro</a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '60px auto 0', padding: '0 24px 90px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(140deg,#08160f,#04100a)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '26px', padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', bottom: '-160px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.3), transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '42px', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px' }}>Créez votre compte gratuit</h2>
            <p style={{ fontSize: '18px', color: '#6ee7b7', maxWidth: '520px', margin: '0 auto 34px', fontWeight: 500, lineHeight: 1.55 }}>Sauvegardez vos transcriptions, retrouvez votre historique et débloquez le post-traitement IA.</p>
            <a href="#" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: '13px', fontSize: '17px', fontWeight: 700, boxShadow: '0 10px 32px rgba(16,185,129,0.5)', display: 'inline-block' }}>Créer un compte gratuit</a>
            <p style={{ fontSize: '13.5px', color: '#8b8fa3', marginTop: '20px', fontWeight: 500 }}>Gratuit pour toujours · Sans carte bancaire</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(140deg,#10b981,#34d399)' }} />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: '#fff', fontSize: '15px' }}>voclaire</span>
          </div>
          <div style={{ fontSize: '13.5px', color: '#6b7280', fontWeight: 500 }}>© 2026 voclaire — Transcription audio par IA</div>
        </div>
      </footer>
    </div>
  )
}
