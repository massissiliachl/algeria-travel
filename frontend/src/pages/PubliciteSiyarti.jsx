import React, { useEffect, useRef, useState } from 'react';
import './PubliciteSiyarti.css';

const MEDIA = `${process.env.PUBLIC_URL}/videos/siyarti`;
const APP_SCREEN = `${MEDIA}/ecran-accueil.jpg`;

const SCENES = [
  {
    file: 'scene-1-proprietaire.mp4',
    voice: 'voix-1-proprietaire.mp3',
    label: 'Propriétaire',
    headline: 'عندك طوموبيل؟ اعرضها للكراء!',
    dialogue: 'عندك طوموبيل وماكش تستعمل فيها كل يوم؟ علاش ما تعرضهاش للكراء مع SIYARTI؟',
    fr: "Tu as une voiture que tu n'utilises pas tous les jours ? Propose-la à la location avec SIYARTI.",
  },
  {
    file: 'scene-2-publication.mp4',
    voice: 'voix-2-publication.mp3',
    label: 'Publication',
    headline: 'اعرض طوموبيلك للكراء بسهولة',
    dialogue: 'مع SIYARTI، تقدر تعرض طوموبيلك للكراء وتحط الصور والسعر تاعك بكل سهولة.',
    mockup: 'publish',
  },
  {
    file: 'scene-3-recherche.mp4',
    voice: 'voix-3-recherche.mp3',
    label: 'Recherche',
    headline: 'تحتاج طوموبيل للكراء؟',
    headlineLater: 'قلّب واختار السيارة اللي تناسبك',
    dialogue: 'تحتاج طوموبيل للويكاند ولا للسفر؟ افتح SIYARTI وقلّب على السيارة اللي تناسبك!',
    mockup: 'search',
  },
  {
    file: 'scene-4-rencontre.mp4',
    voice: 'voix-4-rencontre.mp3',
    label: 'Mise en relation',
    headline: 'SIYARTI تجمع بين صاحب السيارة واللي يحتاجها',
    dialogue: 'اللي عندو طوموبيل وحاب يكريها، واللي يحتاج طوموبيل للكراء، SIYARTI تقرّب بينهم!',
  },
  {
    file: 'scene-5-conclusion.mp4',
    voice: 'voix-5-conclusion.mp3',
    label: 'Conclusion',
    headline: 'للّي يحب يكري، وللّي يحتاج يكري',
    dialogue: 'عندك طوموبيل وحاب تكريها؟ ولا راك تحوس على طوموبيل للكراء؟ SIYARTI هي الحل!',
  },
];

const MISSING = [
  'Voix darija : cinq fichiers à enregistrer par un locuteur algérien, puis à déposer dans frontend/public/videos/siyarti/ (voix-1-proprietaire.mp3 à voix-5-conclusion.mp3). Aucune voix n’est générée ici.',
  'Musique : déposer musique.mp3 au même endroit. Aucune piste n’est inventée.',
  'Écrans d’annonces : seule la capture d’accueil a été fournie. Les listes de voitures, le prix et les disponibilités ne sont pas inventés.',
  'Les plans actuels sont en 720×1280, pas encore en 1080×1920.',
  'L’application n’est pas dans ce dépôt : le texte de fin est « قريبًا », sans lien de téléchargement.',
];

function PubliciteSiyarti() {
  const videoRef = useRef(null);
  const voiceRef = useRef(null);
  const musicRef = useRef(null);
  const playingRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [showFr, setShowFr] = useState(true);

  const scene = SCENES[index];
  playingRef.current = playing;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || ended) return undefined;
    let cancelled = false;
    const start = () => {
      if (cancelled || !playingRef.current) return;
      video.play().catch(() => setPlaying(false));
    };
    video.addEventListener('loadeddata', start);
    video.load();
    return () => {
      cancelled = true;
      video.removeEventListener('loadeddata', start);
    };
  }, [index, ended]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || ended) return;
    if (playing) {
      const pending = video.play();
      if (pending) pending.catch(() => {});
    } else {
      video.pause();
    }
  }, [playing, ended]);

  useEffect(() => {
    const voice = voiceRef.current;
    if (!voice) return;
    voice.pause();
    voice.currentTime = 0;
    if (playing && voiceOn && !ended) {
      const tryPlay = voice.play();
      if (tryPlay) tryPlay.catch(() => setVoiceOn(false));
    }
  }, [index, playing, voiceOn, ended]);

  useEffect(() => {
    const music = musicRef.current;
    if (!music || !musicOn) return;
    if (playing && !ended) {
      const tryPlay = music.play();
      if (tryPlay) tryPlay.catch(() => setMusicOn(false));
    } else {
      music.pause();
    }
  }, [playing, musicOn, ended]);

  const headline = scene.headlineLater && progress > 0.45 ? scene.headlineLater : scene.headline;

  const toggle = () => {
    const video = videoRef.current;
    if (!video || ended) return;
    if (playing) {
      video.pause();
      voiceRef.current?.pause();
      musicRef.current?.pause();
      setPlaying(false);
      return;
    }
    video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const goTo = (next) => {
    setEnded(false);
    setProgress(0);
    setIndex(next);
    setPlaying(true);
  };

  const onEnded = () => {
    if (index < SCENES.length - 1) {
      setProgress(0);
      setIndex(index + 1);
      setPlaying(true);
      return;
    }
    setPlaying(false);
    setEnded(true);
    musicRef.current?.pause();
  };

  const replay = () => {
    setEnded(false);
    setProgress(0);
    setIndex(0);
    setPlaying(true);
  };

  return (
    <main className="siyarti-ad">
      <header className="siyarti-ad__top">
        <p className="siyarti-ad__brand">SIYARTI</p>
        <p>Publicité · location de voitures · 9:16</p>
      </header>

      <div className="siyarti-ad__layout">
        <section className="siyarti-ad__stage" aria-label="Lecteur de la publicité">
          <div className="siyarti-ad__frame">
            {!ended && (
              <video
                ref={videoRef}
                className="siyarti-ad__video"
                src={`${MEDIA}/${scene.file}`}
                playsInline
                preload="auto"
                onTimeUpdate={(event) => {
                  const { currentTime, duration } = event.currentTarget;
                  if (duration) setProgress(currentTime / duration);
                }}
                onEnded={onEnded}
              />
            )}

            {ended && (
              <div className="siyarti-ad__end">
                <img className="siyarti-ad__app" src={APP_SCREEN} alt="Écran d'accueil de l'application" />
                <p className="siyarti-ad__end-line" dir="rtl">للّي يحب يكري، وللّي يحتاج يكري</p>
                <button type="button" onClick={replay}>Revoir</button>
              </div>
            )}

            {!ended && (
              <div className="siyarti-ad__captions">
                <p className="siyarti-ad__headline" dir="rtl">{headline}</p>
                <p className="siyarti-ad__dialogue" dir="rtl">{scene.dialogue}</p>
                {showFr && scene.fr && <p className="siyarti-ad__fr">{scene.fr}</p>}
              </div>
            )}

            {!ended && !playing && (
              <button type="button" className="siyarti-ad__play" onClick={toggle} aria-label="Lecture">
                Lecture
              </button>
            )}
          </div>

          <div className="siyarti-ad__controls">
            <button type="button" onClick={toggle} disabled={ended}>
              {playing ? 'Pause' : 'Lecture'}
            </button>
            <button type="button" onClick={() => index > 0 && goTo(index - 1)} disabled={index === 0 || ended}>
              Scène précédente
            </button>
            <button type="button" onClick={() => index < SCENES.length - 1 && goTo(index + 1)} disabled={index === SCENES.length - 1 || ended}>
              Scène suivante
            </button>
            <label className="siyarti-ad__check">
              <input type="checkbox" checked={showFr} onChange={(event) => setShowFr(event.target.checked)} />
              Sous-titre français de la scène 1
            </label>
          </div>
          <p className="siyarti-ad__now">{ended ? 'Écran final' : `Scène ${index + 1} · ${scene.label}`}</p>
        </section>

        <aside className="siyarti-ad__side">
          {(scene.mockup && !ended) ? (
            <div className="siyarti-ad__mock">
              <h2>L’application à l’écran</h2>
              <img className="siyarti-ad__shot" src={APP_SCREEN} alt="Écran d'accueil de l'application" />
              <p>Capture réelle de l’écran d’accueil. Les écrans d’annonces n’ont pas été fournis, donc ils ne sont pas inventés.</p>
            </div>
          ) : (
            <div className="siyarti-ad__mock">
              <h2>Histoire</h2>
              <ol>
                {SCENES.map((item, sceneIndex) => (
                  <li key={item.file} className={sceneIndex === index && !ended ? 'is-current' : ''}>
                    <button type="button" onClick={() => goTo(sceneIndex)}>{item.label}</button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="siyarti-ad__missing">
            <h2>Encore nécessaire</h2>
            <ul>
              {MISSING.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>
              Voix détectée : {voiceOn ? 'oui' : 'non'}. Musique détectée : {musicOn ? 'oui' : 'non'}.
            </p>
          </div>
        </aside>
      </div>

      <audio
        ref={voiceRef}
        src={`${MEDIA}/${scene.voice}`}
        preload="none"
        onCanPlay={() => setVoiceOn(true)}
        onError={() => setVoiceOn(false)}
      />
      <audio
        ref={musicRef}
        src={`${MEDIA}/musique.mp3`}
        loop
        preload="none"
        onCanPlay={() => setMusicOn(true)}
        onError={() => setMusicOn(false)}
      />
    </main>
  );
}

export default PubliciteSiyarti;
