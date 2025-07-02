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
    </>
  );
}
