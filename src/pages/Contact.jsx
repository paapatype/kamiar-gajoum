import { useState } from 'react';
import Header from '../components/Header.jsx';

const RECIPIENT = 'info@vancouverfineartgallery.com';

export default function Contact({ onOpenMenu }) {
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('Please complete the required fields.');
      return;
    }
    const subject = form.subject.trim() || `Inquiry from ${form.name.trim()}`;
    const body = `${form.message}\n\n—\n${form.name}\n${form.email}`;
    const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setStatus('ok');
  };

  return (
    <div className="page fade-enter">
      <Header
        filter={filter}
        onFilterChange={setFilter}
        onOpenMenu={onOpenMenu}
        showSlider={false}
      />
      <article className="text-page contact-page">
        <span className="eyebrow">Contact</span>
        <h1 className="contact-title">Get in touch</h1>
        <div className="body" style={{ textAlign: 'center' }}>
          <p>
            For acquisitions, commissions, or press inquiries regarding the work
            of Kamiar Gajoum, please use the form below.
          </p>
        </div>

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="cf-name">Name</label>
            <input
              id="cf-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={onChange('name')}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="cf-email">Email</label>
            <input
              id="cf-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field full">
            <label htmlFor="cf-subject">Subject</label>
            <input
              id="cf-subject"
              type="text"
              value={form.subject}
              onChange={onChange('subject')}
              placeholder="Acquisition, commission, press…"
            />
          </div>
          <div className="field full">
            <label htmlFor="cf-message">Message</label>
            <textarea
              id="cf-message"
              value={form.message}
              onChange={onChange('message')}
              placeholder="Tell us a little about your inquiry."
              required
            />
          </div>
          <div className="actions">
            <span className={`status ${status === 'ok' ? 'ok' : ''}`} aria-live="polite">
              {status === 'ok'
                ? 'Thank you — your message is on its way.'
                : status}
            </span>
            <button className="submit" type="submit">
              send message <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
