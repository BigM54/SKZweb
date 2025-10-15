import React, { useEffect, useState } from 'react';
import { Container, Image, ProgressBar } from 'react-bootstrap';

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        const next = old + Math.floor(Math.random() * 10) + 5;
        return next >= 100 ? 100 : next;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100"
    >
      <Image src="/skz_logo.png" alt="Logo" width={120} className="mb-4" />
      <ProgressBar
        now={progress}
        label={`${progress}%`}
        animated
        striped
        style={{ width: '60%' }}
        variant="primary"
      />
    </Container>
  );
}
