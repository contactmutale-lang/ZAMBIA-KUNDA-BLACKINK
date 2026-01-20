// --- 1. SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
    });
}

// --- 2. BOOKING LOGIC ---
const appointmentForm = document.getElementById('appointment-form');
const fileInput = document.getElementById('tattoo-upload');
const fileStatus = document.getElementById('file-status');
let uploadedFileName = "No file uploaded";

// Set minimum date to today
const datePicker = document.getElementById('date');
if (datePicker) { datePicker.min = new Date().toISOString().split("T")[0]; }

fileInput?.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        uploadedFileName = this.files[0].name;
        fileStatus.innerText = `Selected: ${uploadedFileName}`;
    }
});

appointmentForm?.addEventListener('submit', function(e) {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const phone = document.getElementById('phone').value;

    const templateParams = {
        booking_date: date,
        booking_time: time,
        user_phone: phone,
        reference_image: uploadedFileName
    };

    emailjs.send('service_default', 'template_your_id', templateParams)
        .then(() => {
            alert("✅ Booking Request Sent!");
            
            // Save to LocalStorage for "My Bookings"
            const appts = JSON.parse(localStorage.getItem('appointments')) || [];
            appts.push({ ...templateParams, id: Date.now() });
            localStorage.setItem('appointments', JSON.stringify(appts));
            
            appointmentForm.reset();
            fileStatus.innerText = "";
        })
        .catch(err => alert("❌ Error sending request."));
});

// --- 3. MANAGE BOOKINGS ---
window.loadAppointments = function() {
    const phone = document.getElementById('manage-phone').value;
    const list = document.getElementById('appointments');
    const appts = JSON.parse(localStorage.getItem('appointments')) || [];
    
    const filtered = appts.filter(a => a.user_phone === phone);
    list.innerHTML = filtered.map(a => `
        <li class="appointment-card">
            <div><strong>${a.booking_date}</strong> at ${a.booking_time}</div>
            <button class="delete-btn" onclick="deleteAppt(${a.id})">Cancel</button>
        </li>
    `).join('') || "<li>No bookings found.</li>";
};

window.deleteAppt = function(id) {
    let appts = JSON.parse(localStorage.getItem('appointments')) || [];
    appts = appts.filter(a => a.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appts));
    loadAppointments();
};
