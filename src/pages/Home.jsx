import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

function CountdownBanner() {
  const targetDate = new Date('2026-01-17T00:00:00');
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(value);
    useEffect(() => {
      setDisplay(value);
    }, [value]);
    return <span style={{ fontWeight: 700, fontSize: '2rem', transition: 'color 0.2s' }}>{display}</span>;
  }

  // Détection mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  return (
    <div style={{
      width: '100vw',
      maxWidth: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      minHeight: '520px', // hauteur augmentée
      backgroundImage: 'url("/laPlagne2.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: isMobile ? 'scroll' : 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        color: '#fff',
        textAlign: 'center',
        padding: '1.2rem 0',
        borderRadius: '0',
        width: '100%',
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Début de l'évènement dans :</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', fontSize: '1.1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatedNumber value={timeLeft.days} />
            <span style={{ fontSize: '1rem', marginTop: '0.3rem' }}>jours</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatedNumber value={timeLeft.hours} />
            <span style={{ fontSize: '1rem', marginTop: '0.3rem' }}>heures</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatedNumber value={timeLeft.minutes} />
            <span style={{ fontSize: '1rem', marginTop: '0.3rem' }}>minutes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatedNumber value={timeLeft.seconds} />
            <span style={{ fontSize: '1rem', marginTop: '0.3rem' }}>secondes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // Hook pour effet de zoom sur l'image au scroll
  const imgRef = useRef();
  useEffect(() => {
    function handleScroll() {
      if (!imgRef.current) return;
      const scrollY = window.scrollY;
      // Zoom max à +15% à 400px de scroll
      const scale = 1 + Math.min(scrollY / 400, 0.15);
      imgRef.current.style.transform = `scale(${scale})`;
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Image responsive et effet zoom au scroll */}
      <div
        style={{
          backgroundImage: 'url("/laPlagne.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'top center', // haut bien visible
          height: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      </div>
      <Alert 
        variant="primary"
        className="text-center mb-0 stats-section"
        style={{ background: '#fff', fontWeight: '700', fontSize: '2rem', letterSpacing: '0.5px', borderRadius: 0, border: 'none', borderBottom: '2px solid #ffffffff', borderTop: '4px solid #111' }}
      >
        Skiozarts en quelques chiffres
      </Alert>
      {/* Chiffres animés sur fond blanc */}
      <div className="stats-section" style={{ background: '#fff', margin: 0, padding: 0 }}>
        <AnimatedStats />
      </div>
      {/* Bandeau compte à rebours avant l'évènement */}
      <CountdownBanner />
      {/* Section avec image de fond + partenaires */}
      <Container
        fluid
        className="text-center sponsors-section"
        style={{
          backgroundColor: '#f8f9fa',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          borderTop: '1px solid #000000ff',
        }}
      >
        <h2
          className="sponsors-title"
          style={{
            fontWeight: 'bold',
            fontSize: '1.3rem',
            display: 'inline-block',
            paddingBottom: '0.3rem',
            borderBottom: '3px solid #000000ff',
            marginBottom: '0.5rem',
          }}
        >
          Ils nous soutiennent
        </h2>
      </Container>
      {/* Section Nos engagements */}
      <div style={{
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        background: '#f4f8fb',
        padding: '3rem 1rem', // marges latérales
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '2.5rem', color: '#003652' }}>Nos engagements</h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
        }}>
          <EngagementAnimatedSide
            imgSrc="/reeve.png"
            imgAlt="Label Reeve"
            direction="left"
            title=""
            text="Cette année plus que jamais, SKZ place l’éco-responsabilité et l’inclusion au cœur de l’organisation de son séjour. Transport raisonné, réduction des déchets, utilisation de matériel réutilisable, valorisation de partenaires locaux… chaque action s’inscrit dans une démarche globale de respect de l’environnement. Pour donner encore plus de force à cet engagement, SKZ a choisi d’entamer une démarche de labellisation « Événement Éco-Engagé », proposée par le Reeve."
          />
          <EngagementAnimatedSide
            imgSrc="/vss.png"
            imgAlt="VSS"
            direction="right"
            title=""
            text="Nous nous engageons pour la sécurité et la prévention des violences sexuelles et sexistes, avec des dispositifs d'accompagnement et de sensibilisation. Aucun comportement déplacé ne sera toléré : toute attitude inappropriée entraînera une exclusion immédiate de l'évènement."
          />
        </div>
      </div>
      {/* Instagram feed via iframe SociableKit */}
      <div style={{ width: '100vw', maxWidth: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', background: '#fff', padding: '0', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '2rem 0 0 0' }}>Suivez-nous sur Instagram</h2>
        <iframe src='https://widgets.sociablekit.com/instagram-feed/iframe/25599978' frameborder='0' width='100%' height='820'></iframe>
      </div>
    </>
  );
}

// Animation chiffres
function useCountUp(to, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / (duration / 16));
    let raf;
    function update() {
      start += step;
      if (start >= to) {
        setCount(to);
      } else {
        setCount(start);
        raf = requestAnimationFrame(update);
      }
    }
    raf = requestAnimationFrame(update);
    return () => raf && cancelAnimationFrame(raf);
  }, [to, duration]);
  return count;
}
function AnimatedStats() {
  const stats = [
    { label: 'Participants', value: 1500 },
    { label: 'Festival', value: 1 },
    { label: 'Soirées à thèmes', value: 6 },
    { label: "Anim's pistes", value: 20 },
    { label: 'Village', value: 550 }, // 550m²
  ];
  const sectionRef = useRef();
  const [visible, setVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasBeenVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // On ne lance l'animation que quand visible, en forçant le remount du container
  return (
    <div ref={sectionRef} style={{ minHeight: 100, opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>
      {visible && (
        <AnimatedStatsNumbers key={Date.now()} stats={stats} />
      )}
    </div>
  );
}

function AnimatedStatsNumbers({ stats }) {
  return (
    <Container fluid className="py-3 stats-section" style={{ background: '#fff', fontSize: '1.1rem' }}>
      <Row className="justify-content-center align-items-center stats-row-responsive" style={{ gap: '0.5rem' }}>
        {stats.map((stat, idx) => {
          const count = useCountUp(stat.value, 1000 + idx * 150);
          return (
            <Col xs={6} sm={4} md={2} key={stat.label} className="mb-2 mb-md-0 px-1">
              <div className="stats-number" style={{ fontSize: '1.7rem', fontWeight: 700 }}>{count}{stat.label === 'Village' ? 'm²' : ''}</div>
              <div className="stats-label" style={{ fontSize: '0.95rem' }}>{stat.label}</div>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

// Composant animé pour chaque engagement
function EngagementAnimatedSide({ imgSrc, imgAlt, direction, title, text }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: direction === 'left' ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: '1.5rem',
        minWidth: 280,
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(0)'
          : direction === 'left'
          ? 'translateX(-80px)'
          : 'translateX(80px)',
        transition: 'all 0.7s cubic-bezier(.77,0,.18,1)',
      }}
    >
      <img
        src={imgSrc}
        alt={imgAlt}
        style={{ width: 350, height: 350, objectFit: 'contain', borderRadius: 18, boxShadow: '0 2px 18px #00365222' }}
      />
      <div>
        {/* Pas de titre individuel */}
        <div style={{ fontSize: '0.98rem', color: '#003652' }}>{text}</div>
      </div>
    </div>
  );
}