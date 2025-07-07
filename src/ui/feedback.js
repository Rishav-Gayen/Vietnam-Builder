export const showDestinationAdded = (tripData) => {
  // ... existing validation checks ...

   if (!tripData || !tripData.destination || !tripData.tripDetails || !Array.isArray(tripData.tripDetails.activities)) {
    console.error('Invalid trip data structure:', tripData);
    return;
  }

  // Get the success message element
  const successEl = document.getElementById('success-message');
  if (!successEl) {
    console.warn('Success message element not found');
    return;
  }

  // Build form with validation structure
  successEl.innerHTML = `
    <div class="success-icon">
      <i class="fas fa-check-circle"></i>
    </div>
    <h3>Customer Details</h3>
    <form id="customer-details-form" novalidate>
      <div class="form-group">
        <label for="customer-name">Full Name <span class="required">*</span></label>
        <input type="text" id="customer-name" name="name" required minlength="2">
        <div class="error-message" id="name-error"></div>
      </div>
      <div class="form-group">
        <label for="customer-email">Email Address <span class="required">*</span></label>
        <input type="email" id="customer-email" name="email" required>
        <div class="error-message" id="email-error"></div>
      </div>
      <div class="form-group">
        <label for="customer-phone">Phone Number <span class="required">*</span></label>
        <input type="tel" id="customer-phone" name="phone" required pattern="[0-9+\-\s]{8,}">
        <div class="error-message" id="phone-error"></div>
      </div>
      <div class="form-buttons">
        <button type="button" class="cancel-btn">Cancel</button>
        <button type="submit" class="submit-btn">Submit Trip</button>
      </div>
    </form>
  `;

  const form = successEl.querySelector('#customer-details-form');
  const cancelBtn = successEl.querySelector('.cancel-btn');

  // Validation function
  const validateField = (input) => {
    const errorElement = document.getElementById(`${input.name}-error`);
    const value = input.value.trim();
    let isValid = true;

    // Reset state
    input.classList.remove('error-input');
    errorElement.textContent = '';

    // Check for empty fields
    if (!value) {
      errorElement.textContent = 'This field is required';
      input.classList.add('error-input');
      isValid = false;
    }
    // Additional validation
    else if (input.name === 'name' && value.length < 2) {
      errorElement.textContent = 'Name too short';
      input.classList.add('error-input');
      isValid = false;
    }
    else if (input.name === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      errorElement.textContent = 'Invalid email format';
      input.classList.add('error-input');
      isValid = false;
    }
    else if (input.name === 'phone' && !/^[\d\s\+\-\(\)]{8,}$/.test(value)) {
      errorElement.textContent = 'Invalid phone number';
      input.classList.add('error-input');
      isValid = false;
    }

    return isValid;
  };

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate all fields
    const fieldsValid = Array.from(form.elements)
      .filter(el => ['name', 'email', 'phone'].includes(el.name))
      .every(field => validateField(field));

    if (!fieldsValid) {
      // Show general error if all fields empty
      if (!form.name.value.trim() && !form.email.value.trim() && !form.phone.value.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          html: `Please fill out all required fields:
            <ul>
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
            </ul>`,
          confirmButtonText: 'OK'
        });
      }
      return;
    }

    // Proceed with valid data
    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      trip: tripData
    };

    // ... existing submission logic ...

  });

  // Real-time validation
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      input.classList.remove('error-input');
      document.getElementById(`${input.name}-error`).textContent = '';
    });
  });

  // ... rest of existing code ...
};