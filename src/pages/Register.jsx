import { useState, useRef } from 'react';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert, Spinner, Collapse
} from 'reactstrap';
import { useSignUp, useAuth} from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

export default function RegisterAndVerify() {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const userMetadataRef = useRef(null);
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [formData, setFormData] = useState({
    bucque: '',
    num: '',
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    numero: '',
    tabagns: '',
    proms: null,
    peks: false,
    charte: false,
    acceptCousins: false
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { email, password, confirmPassword, prenom, nom, numero, peks, acceptCousins, bucque, num, proms } = formData;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return setLoading(false);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Adresse email invalide.");
      return setLoading(false);
    }

    const phoneRegex = /^(0[67]\d{8}|\+[\d]{6,15})$/;
    if (!phoneRegex.test(numero.replace(/\s/g, ''))) {
      setError("Numéro invalide.");
      return setLoading(false);
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!pwdRegex.test(password) || password.length < 8) {
      setError("Mot de passe invalide.");
      return setLoading(false);
    }

    // Vérification du format de proms (doit être un entier positif raisonnable)
    if (!peks) {
      const promsInt = parseInt(proms, 10);
      if (isNaN(promsInt)) {
        setError("Le champ Prom's doit être un entier valide (ex: 224).");
        setLoading(false);
        return;
      }
    }

        // Num's devient facultatif même si acceptCousins est coché
    let numsArr = [];
    if (acceptCousins && !peks) {
          if (num && !/^\d{1,3}(-\d{1,3})*$/.test(num)) {
        setError("Format du champ num invalide. Exemple attendu : 12-234-2-34");
        setLoading(false);
        return;
      }
          if (num) {
            numsArr = num.split('-');
            if (numsArr.length > 6) numsArr = numsArr.slice(0, 6);
          }
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          email,
          numero,
          prenom,
          nom,
          peks,
          num: peks ? null : num,
          bucque: peks ? null : bucque,
          proms: peks ? null : formData.proms,
          tabagns: peks ? null : formData.tabagns,
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      userMetadataRef.current = {
        prenom,
        nom,
        numero,
        peks,
        num: peks ? null : num,
        bucque: peks ? null : bucque,
        proms: peks ? null : formData.proms,
        tabagns: peks ? null : formData.tabagns,
        acceptCousins,
        email,
        numsArr,
      };
      setStep('verify');
    } catch (err) {
      console.error("Erreur brut Clerk:", err);
      const fallback =
        typeof err === 'string' ? err :
        err?.errors?.[0]?.message ||
        err?.message ||
        JSON.stringify(err, null, 2) ||
        "Erreur inconnue";

      setError(fallback);
    }
    setLoading(false);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: result.createdSessionId });

      // 🔐 Récupération du token Clerk
      const token = await getToken({ template: 'supabase' });

      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const metadata = userMetadataRef.current;
      const {
        prenom, nom, numero, num: nums, tabagns, proms, bucque, peks, acceptCousins, email: mail, numsArr
      } = metadata;

      const { error: insertError } = await supabase.from('profils').insert([{
        prenom,
        nom,
        numero,
        nums,
        bucque,
        proms,
        tabagns,
        peks,
      }]);
      // Ajout des infos cousins si accepté
      if (acceptCousins && !peks) {
        const cousinData = {
          email: mail?.toLowerCase(),
          numero,
          bucque,
        };
        numsArr.forEach((n, i) => {
          cousinData[`nums${i+1}`] = n;
        });
        const { error: cousinError } = await supabase.from('cousin').insert([cousinData]);
        if (cousinError) {
          console.error('Supabase cousin insert error:', cousinError);
          setError("Erreur lors de l'enregistrement des cousins.");
          setLoading(false);
          return;
        }
      }
      setStep('done');
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      console.error("Clerk verification error:", err);
      const msg = err?.errors?.[0]?.message || err?.message || 'Erreur lors de la vérification.';
      setError(msg);
    }

    setLoading(false);
  };

  if (!isLoaded) return null;

  return (
    <div className="full-width mt-4 p-4 border rounded shadow">
      <h2 className="text-center text-primary mb-3">
        {step === 'register' ? 'Créer un compte' : 'Vérifie ton email'}
      </h2>
      {error && <Alert color="danger">{error}</Alert>}

      {step === 'register' && (
        <Form onSubmit={handleRegister}>
          <div className="mb-2 text-start" style={{fontSize:'0.9em'}}><span style={{color:'red'}}>*</span> Champs obligatoires</div>
          <FormGroup check className="mb-3 d-flex align-items-center gap-2">
            <Input type="checkbox" name="peks" checked={formData.peks} onChange={handleChange} style={{ width: '1.5rem', height: '1.5rem' }} />
            <Label check>{"Je suis un Pek’s (non-gadz, les .onscrits vous êtes pas Pek's) ?"}</Label>
          </FormGroup>

          <FormGroup><Label>Prénom <span style={{color:'red'}}>*</span></Label><Input name="prenom" value={formData.prenom} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Nom <span style={{color:'red'}}>*</span></Label><Input name="nom" value={formData.nom} onChange={handleChange} required /></FormGroup>

          <Collapse isOpen={!formData.peks}>
            <FormGroup><Label>Bucque / Surnom</Label><Input name="bucque" value={formData.bucque} onChange={handleChange} /></FormGroup>
            <FormGroup><Label>Num's / Fam's</Label><Input name="num" value={formData.num} onChange={handleChange} placeholder="Ex: 12-234-2-34 (facultatif)" /></FormGroup>
            <FormGroup>
              <Label>{"Tabagn's (Campus)"} <span style={{color:'red'}}>*</span></Label>
              <Input type="select" name="tabagns" value={formData.tabagns} onChange={handleChange} required={!formData.peks}>
                <option value="">-- Choisir --</option>
                <option value="sibers">Siber's</option>
                <option value="kin">KIN</option>
                <option value="cluns">Clun's</option>
                <option value="p3">P3</option>
                <option value="boquette">Boquette</option>
                <option value="bordels">Bordel's</option>
                <option value="birse">Birse</option>
                <option value="chalons">Chalon's</option>
              </Input>
            </FormGroup>
            <FormGroup><Label>{"Prom's (1A : 225, 2A : 224)"} <span style={{color:'red'}}>*</span></Label><Input type="number" name="proms" value={formData.proms} onChange={handleChange} required={!formData.peks} /></FormGroup>
          </Collapse>

          <FormGroup><Label>Email <span style={{color:'red'}}>*</span></Label><Input type="email" name="email" value={formData.email} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Numéro <span style={{color:'red'}}>*</span></Label><Input type="tel" name="numero" value={formData.numero} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Mot de passe <span style={{color:'red'}}>*</span></Label><Input type="password" name="password" value={formData.password} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Confirmer <span style={{color:'red'}}>*</span></Label><Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></FormGroup>

          <FormGroup check className="mb-3 d-flex align-items-center gap-2">
            <Input type="checkbox" name="charte" checked={formData.charte} onChange={handleChange} required style={{ width: '1.5rem', height: '1.5rem' }} />
            <Label check>
              J'ai lu et je m'engage à respecter la
              {' '}<a href="/Charte_De_Bonne_Conduite_Participant_SKZ_2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>charte de bonne conduite</a> (obligatoire)
            </Label>
          </FormGroup>
          {!formData.peks && (
            <FormGroup check className="mb-3 d-flex align-items-center gap-2">
              <Input type="checkbox" name="acceptCousins" checked={formData.acceptCousins} onChange={handleChange} style={{ width: '1.5rem', height: '1.5rem' }} />
              <Label check>
                J'accepte de transmettre mes coordonnées à mes cousins des autres tabagn's
              </Label>
            </FormGroup>
          )}

          <Button color="primary" type="submit" block disabled={loading || !formData.charte}>
            {loading ? <Spinner size="sm" /> : 'Créer mon compte'}
          </Button>
        </Form>
      )}
      {step === 'verify' && (
        <Form onSubmit={handleVerification}>
          <p>Un code a été envoyé à <strong>{formData.email}</strong>. Vérifie ta boîte mail.</p>
          <FormGroup>
            <Label>Code reçu</Label>
            <Input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: 123456" required />
          </FormGroup>
          <Button type="submit" color="primary" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Vérifier le code'}
          </Button>
        </Form>
      )}
      {step === 'done' && (
        <Alert color="success" className="text-center">
          ✅ Ton email a été vérifié avec succès. <br />
          🔄 Redirection en cours...
        </Alert>
      )}
    </div>
  );
}
