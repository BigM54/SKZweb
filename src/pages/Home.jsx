import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [flipStates, setFlipStates] = useState({
    days: false,
    hours: false,
    minutes: false,
    seconds: false,
  });
  const [prevTime, setPrevTime] = useState(timeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextTime = getTimeLeft();

      // On compare chaque unité et on met à true la flipState si la valeur change
      setFlipStates({
        days: nextTime.days !== prevTime.days,
        hours: nextTime.hours !== prevTime.hours,
        minutes: nextTime.minutes !== prevTime.minutes,
        seconds: nextTime.seconds !== prevTime.seconds,
      });

      setPrevTime(nextTime);
      setTimeLeft(nextTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [prevTime]);

  function getTimeLeft() {
    const target = new Date('2026-01-17T00:00:00');
    const now = new Date();
    const diff = target - now;

    return {
      days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
      seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
    };
  }

  const renderBox = (value, label, key) => {
    const isFlipping = flipStates[key];

    return (
      <Col xs={3} key={label} className="d-flex justify-content-center">
        <div
          className={`flip-box ${isFlipping ? 'flip' : ''}`}
          // On retire la classe 'flip' après animation pour permettre la prochaine animation
          onAnimationEnd={() => {
            if (isFlipping) {
              setFlipStates(flip => ({ ...flip, [key]: false }));
            }
          }}
        >
          <div className="flip-value">{value.toString().padStart(2, '0')}</div>
          <div className="flip-label">{label}</div>
        </div>
      </Col>
    );
  };

  return (
    <>
      <Alert variant="light" className="text-center mb-0" style={{ fontWeight: '600' }}>
        36e édition du plus grand événement de ski étudiant d'Europe ! ✨
      </Alert>

      {/* Section avec image de fond + compte à rebours */}
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
        <Container>
          <Row className="justify-content-center">
            {renderBox(timeLeft.days, 'jours', 'days')}
            {renderBox(timeLeft.hours, 'heures', 'hours')}
            {renderBox(timeLeft.minutes, 'minutes', 'minutes')}
            {renderBox(timeLeft.seconds, 'secondes', 'seconds')}
          </Row>
        </Container>
      </div>
      <Container
        fluid
        className="text-center"
        style={{
          backgroundColor: '#f8f9fa',
          paddingTop: '1rem',
          paddingBottom: '1rem',   // moins haut qu'avant (au lieu de py-5)
        }}
      >
        <h2
          style={{
            fontWeight: 'bold',
            fontSize: '2.5rem',
            display: 'inline-block',
            paddingBottom: '0.3rem',
            borderBottom: '3px solid #0d1c31', // petit bord sous le texte
            marginBottom: '0.5rem', // espace entre texte et bord en dessous
          }}
        >
          Ils nous soutiennent
        </h2>
      </Container>
      <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa' }}>
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
