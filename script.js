const form = document.getElementById('registerForm');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');
const certificate = document.getElementById('certificate');
const themeToggle = document.getElementById('themeToggle');

const storageKey = 'sacc-registration-draft';
const themeKey = 'sacc-registration-theme';

const getFieldValue = (name) => {
  const field = form.elements[name];

  if (field && field.type === 'radio') {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  if (field) {
    return field.value.trim();
  }

  return '';
};

const setFieldValue = (name, value) => {
  const field = form.elements[name];

  if (field && field.type === 'radio') {
    const target = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (target) {
      target.checked = true;
    }
    return;
  }

  if (field) {
    field.value = value || '';
  }
};

const applyTheme = (isDark) => {
  document.body.classList.toggle('dark', isDark);
  const icon = themeToggle.querySelector('.toggle-icon');
  const text = themeToggle.querySelector('.toggle-text');

  if (isDark) {
    icon.textContent = '☀️';
    text.textContent = '浅色模式';
  } else {
    icon.textContent = '🌙';
    text.textContent = '深色模式';
  }
};

const getFieldWrapper = (name) => {
  const radioInputs = form.querySelectorAll(`input[name="${name}"]`);
  if (radioInputs.length) {
    return form.querySelector('.radio-group');
  }

  const field = form.elements.namedItem(name);
  return field?.closest('.field');
};

const getInputElement = (name) => {
  const radioInputs = form.querySelectorAll(`input[name="${name}"]`);
  if (radioInputs.length) {
    return radioInputs[0];
  }

  return form.elements.namedItem(name);
};

const showError = (name, message) => {
  const field = getInputElement(name);
  const wrapper = getFieldWrapper(name);
  const errorText = wrapper?.querySelector('.error-text');
  const radioInputs = form.querySelectorAll(`input[name="${name}"]`);

  if (radioInputs.length) {
    radioInputs.forEach((input) => input.classList.add('invalid'));
  } else if (field) {
    field.classList.add('invalid');
  }

  if (errorText) {
    errorText.textContent = message;
  }
};

const clearError = (name) => {
  const field = getInputElement(name);
  const wrapper = getFieldWrapper(name);
  const errorText = wrapper?.querySelector('.error-text');
  const radioInputs = form.querySelectorAll(`input[name="${name}"]`);

  if (radioInputs.length) {
    radioInputs.forEach((input) => input.classList.remove('invalid'));
  } else if (field) {
    field.classList.remove('invalid');
  }

  if (errorText) {
    errorText.textContent = '';
  }
};

const validateField = (name) => {
  const value = getFieldValue(name);

  switch (name) {
    case 'name':
      if (!value) {
        showError(name, '姓名不能为空');
        return false;
      }
      clearError(name);
      return true;
    case 'studentId':
      if (!value) {
        showError(name, '学号不能为空');
        return false;
      }
      if (!/^20\d{8,10}$/.test(value)) {
        showError(name, '学号格式不正确，通常为 20 开头的 10~12 位数字');
        return false;
      }
      clearError(name);
      return true;
    case 'college':
      if (!value) {
        showError(name, '学院/专业不能为空');
        return false;
      }
      clearError(name);
      return true;
    case 'phone':
      if (!value) {
        showError(name, '手机号不能为空');
        return false;
      }
      if (!/^\d{11}$/.test(value)) {
        showError(name, '手机号必须为 11 位数字');
        return false;
      }
      clearError(name);
      return true;
    case 'email':
      if (!value) {
        showError(name, '邮箱不能为空');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showError(name, '请输入正确的邮箱格式');
        return false;
      }
      clearError(name);
      return true;
    case 'category':
      if (!value) {
        showError(name, '请选择参赛类别');
        return false;
      }
      clearError(name);
      return true;
    case 'adjustment': {
      const radioValue = getFieldValue('adjustment');
      if (!radioValue) {
        showError(name, '请选择是否服从调剂');
        return false;
      }
      clearError(name);
      return true;
    }
    case 'intro':
      if (!value) {
        showError(name, '个人简介不能为空');
        return false;
      }
      if (value.length < 20) {
        showError(name, '个人简介至少 20 个字符');
        return false;
      }
      clearError(name);
      return true;
    default:
      return true;
  }
};

const saveDraft = () => {
  const formData = {};

  Array.from(form.elements).forEach((element) => {
    if (!element.name) return;

    if (element.type === 'radio') {
      if (element.checked) {
        formData[element.name] = element.value;
      }
      return;
    }

    if (element.type !== 'submit' && element.type !== 'reset' && element.type !== 'button') {
      formData[element.name] = element.value;
    }
  });

  localStorage.setItem(storageKey, JSON.stringify(formData));
};

const restoreDraft = () => {
  const savedDraft = localStorage.getItem(storageKey);

  if (!savedDraft) return;

  try {
    const parsed = JSON.parse(savedDraft);
    Object.entries(parsed).forEach(([name, value]) => {
      setFieldValue(name, value);
    });
  } catch (error) {
    console.warn('Draft restore failed:', error);
  }
};

const renderCertificate = (data) => {
  const now = new Date();
  const code = `SACC-${now.getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  document.getElementById('inviteCode').textContent = code;
  document.getElementById('certificateName').textContent = data.name;
  document.getElementById('certificateCategory').textContent = data.category;
  document.getElementById('certificateTime').textContent = `${now.toLocaleDateString('zh-CN')} ${now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;

  certificate.classList.remove('hidden');
  certificate.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const openSuccessModal = () => {
  successModal.classList.remove('hidden');
};

const closeSuccessModal = () => {
  successModal.classList.add('hidden');
};

Array.from(form.elements).forEach((element) => {
  if (!element.name) return;

  element.addEventListener('input', () => {
    if (element.type === 'radio') {
      validateField(element.name);
    } else {
      validateField(element.name);
    }
    saveDraft();
  });

  element.addEventListener('change', () => {
    validateField(element.name);
    saveDraft();
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const requiredFields = ['name', 'studentId', 'college', 'phone', 'email', 'category', 'adjustment', 'intro'];
  let isValid = true;

  requiredFields.forEach((fieldName) => {
    if (!validateField(fieldName)) {
      isValid = false;
    }
  });

  if (!isValid) {
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  const payload = {
    name: getFieldValue('name'),
    studentId: getFieldValue('studentId'),
    college: getFieldValue('college'),
    phone: getFieldValue('phone'),
    email: getFieldValue('email'),
    category: getFieldValue('category'),
    adjustment: getFieldValue('adjustment'),
    intro: getFieldValue('intro')
  };

  localStorage.removeItem(storageKey);
  renderCertificate(payload);
  openSuccessModal();
});

form.addEventListener('reset', () => {
  localStorage.removeItem(storageKey);
  setTimeout(() => {
    Array.from(form.elements).forEach((element) => {
      if (!element.name) return;
      if (element.type !== 'radio') {
        clearError(element.name);
      }
      if (element.type === 'radio') {
        clearError(element.name);
      }
    });
  }, 0);
});

closeModalBtn.addEventListener('click', closeSuccessModal);
successModal.addEventListener('click', (event) => {
  if (event.target === successModal) {
    closeSuccessModal();
  }
});

themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem(themeKey, String(isDark));
});

const initTheme = () => {
  const savedTheme = localStorage.getItem(themeKey) === 'true';
  applyTheme(savedTheme);
};

initTheme();
restoreDraft();
