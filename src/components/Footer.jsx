import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-socials">
        <a href="https://www.facebook.com/skiozarts" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <i className="bi bi-facebook" /> Facebook
        </a>
        <a href="https://www.instagram.com/skiozarts/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <i className="bi bi-instagram" /> Instagram
        </a>
        <a href="mailto:contact@skiozarts.fr" aria-label="Mail">
          <i className="bi bi-envelope" /> contact@skiozarts.fr
        </a>
      </div>
      <div>
        © {new Date().getFullYear()} Skioz'Arts — Tous droits réservés
      </div>
      <div>
        <a href="/contact">Contact</a> | <a href="/faq">FAQ</a>
      </div>
    </footer>
  );
}