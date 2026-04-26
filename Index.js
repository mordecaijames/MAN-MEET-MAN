

const FORM_CONFIG = {
    googleSheetEndpoint: 'https://script.google.com/macros/s/AKfycbwX1yd7XbpLD-_ibMxCrco_eSb-sQoq47_XFPtsm6-Oiqp97kfYgG_RUbRWGQbXc9d5BQ/exec',
    eventDateTime: '25th – 26th April 2026 (3PM Daily)'
};

// ===== DOM =====
const form            = document.getElementById('registrationForm');
const successModal    = document.getElementById('successModal');
const eventDateTimeEl = document.getElementById('eventDateTime');
const submitBtn       = form.querySelector('.btn-submit');
const btnText         = submitBtn.querySelector('.btn-text');

// =====================================================================
// ALREADY-REGISTERED GUARD
// =====================================================================
const STORAGE_KEY = 'mmm2026_registered';

function markAsRegistered(name) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            name:      name,
            timestamp: new Date().toISOString()
        }));
    } catch (_) { /* private/incognito — silently skip */ }
}

function isAlreadyRegistered() {
    try {
        return !!localStorage.getItem(STORAGE_KEY);
    } catch (_) { return false; }
}

function getRegisteredName() {
    try {
        const entry = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return entry.name || 'You';
    } catch (_) { return 'You'; }
}

function showAlreadyRegisteredBanner() {
    const name = getRegisteredName().split(' ')[0];

    form.closest('.container').innerHTML = `
        <div style="
            background: rgba(255,255,255,0.96);
            border-radius: 10px;
            border-top: 4px solid #C8102E;
            padding: 3rem 2.5rem;
            text-align: center;
            max-width: 560px;
            margin: 3rem auto;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            font-family: 'Barlow', sans-serif;
        ">
            <div style="
                width: 72px; height: 72px;
                background: #C8102E;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 32px; color: #fff; font-weight: 700;
            ">✓</div>
            <h2 style="
                font-family: 'Barlow Condensed', sans-serif;
                font-size: 1.8rem; font-weight: 900;
                letter-spacing: 2px; text-transform: uppercase;
                color: #0A0A0A; margin: 0 0 0.8rem;
            ">Already Registered, ${name}!</h2>
            <p style="font-size: 0.95rem; color: #555; line-height: 1.7; margin: 0 0 1rem;">
                Our records show you've already secured your seat at
                <strong style="color:#C8102E;">Man Meets Man 2026</strong>.
                Check your email for your confirmation and event details.
            </p>
            <div style="
                background: #F8F6F6; border-left: 4px solid #C8102E;
                border-radius: 6px; padding: 1rem 1.2rem;
                text-align: left; margin-bottom: 1.5rem;
            ">
                <p style="margin:0 0 0.4rem; font-size:0.78rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#AAA;">Event Details</p>
                <p style="margin:0.3rem 0; font-size:0.9rem; color:#333;">📅 &nbsp;25th – 26th April 2026</p>
                <p style="margin:0.3rem 0; font-size:0.9rem; color:#333;">🕒 &nbsp;3:00 PM Daily</p>
                <p style="margin:0.3rem 0; font-size:0.9rem; color:#333;">📍 &nbsp;Lifegate People's Assembly, Gwari Ave, Barnawa GRA, Kaduna</p>
            </div>
            <p style="font-size:0.82rem; color:#AAA; margin:0;">
                Not you? <a href="javascript:void(0)" onclick="clearRegistrationData()"
                    style="color:#C8102E; font-weight:700; text-decoration:none;">Click here to register a different person</a>
            </p>
        </div>
    `;
}

function clearRegistrationData() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    location.reload();
}

if (isAlreadyRegistered()) {
    document.addEventListener('DOMContentLoaded', showAlreadyRegisteredBanner);
}

// ===== Validation Helpers =====
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = v => /^[\d\s\-\+\(\)]{10,}$/.test(v.replace(/\s/g, ''));

function validateField(field) {
    const group = field.closest('.form-group');
    const val   = field.value.trim();
    let ok = true;
    if (!val)                                          ok = false;
    if (ok && field.type === 'email' && !isEmail(val)) ok = false;
    if (ok && field.type === 'tel'   && !isPhone(val)) ok = false;
    group.classList.toggle('error', !ok);
    return ok;
}

function validateRadioGroup(name) {
    const radios  = form.querySelectorAll(`input[name="${name}"]`);
    const checked = Array.from(radios).some(r => r.checked);
    radios[0].closest('.form-group').classList.toggle('error', !checked);
    return checked;
}

function validateCheckboxGroup(name) {
    const boxes   = form.querySelectorAll(`input[name="${name}"]`);
    const checked = Array.from(boxes).some(b => b.checked);
    const group   = document.getElementById('attendanceGroup');
    if (group) group.classList.toggle('error', !checked);
    return checked;
}

function validateForm() {
    let valid = true;

    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea')
        .forEach(f => { if (!validateField(f)) valid = false; });

    ['ageRange', 'maritalStatus', 'eventSource']
        .forEach(n => { if (!validateRadioGroup(n)) valid = false; });

    if (!validateCheckboxGroup('attendance')) valid = false;

    return valid;
}

function showFieldError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const group = field.closest('.form-group');
    const span  = group.querySelector('.error-message');
    if (span) span.textContent = msg;
    group.classList.add('error');
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field.focus();
}

// ===== Real-time Validation =====
form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea')
    .forEach(f => {
        f.addEventListener('blur',  () => validateField(f));
        f.addEventListener('focus', () => f.closest('.form-group').classList.remove('error'));
    });

form.querySelectorAll('input[type="radio"]')
    .forEach(r => r.addEventListener('change', () => r.closest('.form-group').classList.remove('error')));

form.querySelectorAll('input[type="checkbox"]')
    .forEach(c => c.addEventListener('change', () => {
        const group = document.getElementById('attendanceGroup');
        if (group) group.classList.remove('error');
    }));

// ===== Collect Form Data =====
function collectFormData() {
    const fd = new FormData(form);

    const attendanceDays = Array.from(form.querySelectorAll('input[name="attendance"]:checked'))
        .map(c => c.value)
        .join(', ');

    return {
        fullName:         fd.get('fullName'),
        email:            fd.get('email'),
        phone:            fd.get('phone'),
        address:          fd.get('address'),
        ageRange:         fd.get('ageRange'),
        maritalStatus:    fd.get('maritalStatus'),
        attendance:       attendanceDays || 'Not selected',
        eventSource:      fd.get('eventSource'),
        expectations:     fd.get('expectations'),
        registrationDate: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
        timestamp:        new Date().toISOString()
    };
}

// ===== Submit to Google Sheets =====
async function submitToGoogleSheet(data) {
    try {
        const res = await fetch(FORM_CONFIG.googleSheetEndpoint, {
            method:  'POST',
            headers: { 'Content-Type': 'text/plain' },
            body:    JSON.stringify({ action: 'addRegistration', ...data })
        });
        return await res.json();
    } catch (corsErr) {
        await fetch(FORM_CONFIG.googleSheetEndpoint, {
            method:  'POST',
            mode:    'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body:    JSON.stringify({ action: 'addRegistration', ...data })
        });
        return { success: true, code: 'SUCCESS' };
    }
}

// ===== Loading State =====
function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('loading', on);
    if (btnText) btnText.textContent = on ? 'Submitting…' : 'Register Now';
}

// ===== Submit Handler =====
form.addEventListener('submit', async e => {
    e.preventDefault();

    if (isAlreadyRegistered()) {
        showAlreadyRegisteredBanner();
        return;
    }

    if (!validateForm()) {
        const first = form.querySelector('.form-group.error');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    setLoading(true);

    const data = collectFormData();

    try {
        const result = await submitToGoogleSheet(data);

        if (result?.success === false) {
            if (result.code === 'ALREADY_REGISTERED') {
                markAsRegistered(data.fullName);
                showAlreadyRegisteredBanner();
            } else {
                alert('Registration failed: ' + (result.message || 'Unknown error. Please try again.'));
            }
            return;
        }

        markAsRegistered(data.fullName);

        eventDateTimeEl.textContent = FORM_CONFIG.eventDateTime;
        successModal.classList.add('show');
        form.reset();
        form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    } catch (err) {
        console.error('Registration error:', err);
        alert('Network error. Please check your connection and try again.\n\n' + err.message);
    } finally {
        setLoading(false);
    }
});

// ===== Modal =====
function closeModal() { successModal.classList.remove('show'); }

successModal.addEventListener('click', e => { if (e.target === successModal) closeModal(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && successModal.classList.contains('show')) closeModal();
});

console.log('✅ Man Meets Man 2026 — Registration loaded');
