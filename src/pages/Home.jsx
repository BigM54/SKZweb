import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

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
          backgroundPosition: 'center',
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
      <Container fluid className="py-4 sponsors-section" style={{ backgroundColor: '#f8f9fa' }}>
        <Row className="justify-content-center align-items-center">
          <Col xs="auto">
            <a href="https://www.rolex.com" target="_blank" rel="noopener noreferrer">
              <img src="/Rolex.png" alt="Rolex" style={{ maxHeight: '80px', margin: '1rem' }} />
            </a>
          </Col>
          <Col xs="auto">
            <a href="https://www.gucci.com" target="_blank" rel="noopener noreferrer">
              <img src="/Gucci.png" alt="Gucci" style={{ maxHeight: '80px', margin: '1rem' }} />
            </a>
          </Col>
          <Col xs="auto">
            <a href="https://youtu.be/dQw4w9WgXcQ?si=NOz9qFdokahj36y8" target="_blank" rel="noopener noreferrer">
              <img src="/Jacquie.png" alt="Jacquie" style={{ maxHeight: '80px', margin: '1rem' }} />
            </a>
          </Col>
          <Col xs="auto">
            <a href="https://www.Bugatti.com" target="_blank" rel="noopener noreferrer">
              <img src="/Bugatti.png" alt="Bugatti" style={{ maxHeight: '80px', margin: '1rem' }} />
            </a>
          </Col>
        </Row>
      </Container>
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
    { label: 'Participants', value: 1200 },
    { label: 'Soirées', value: 6 },
    { label: 'Animations', value: 15 },
    { label: 'Bus affrétés', value: 18 },
    { label: 'Litres de vin chaud', value: 800 },
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
    <div ref={sectionRef} style={{ minHeight: 120, opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>
      {visible && (
        <AnimatedStatsNumbers key={Date.now()} stats={stats} />
      )}
    </div>
  );
}

function AnimatedStatsNumbers({ stats }) {
  return (
    <Container fluid className="py-4 stats-section" style={{ background: '#fff' }}>
      <Row className="justify-content-center align-items-center">
        {stats.map((stat, idx) => {
          const count = useCountUp(stat.value, 1200 + idx * 200);
          return (
            <Col xs={6} md={2} key={stat.label} className="mb-3 mb-md-0">
              <div className="stats-number">{count}</div>
              <div className="stats-label">{stat.label}</div>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}