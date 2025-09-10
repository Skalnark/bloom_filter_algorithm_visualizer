import i18next from 'i18next';

export async function initializeLocales() {

    let i18n = await i18next.init({
        lng: 'en',
        resources: {
            en: { translation: await import('./locales/en.json') }
        }
    });

    document.title = i18next.t('title');
    const mainTitle = document.querySelector('.main-title');
    let span = document.createElement('span');
    span.id = 'main-title-icon';
    span.textContent = '> ';
    if (mainTitle) {
        mainTitle.innerText = '';
        mainTitle.innerText = i18next.t('title');
        mainTitle.prepend(span);
    }

    const filterSizeLabel = document.querySelector('label[for="bf-bit-size-input"]');
    if (filterSizeLabel) filterSizeLabel.innerText = i18next.t('filter_size_label');

    const dummyWordsLabel = document.querySelector('label[for="bf-dummy-count-input"]');
    if (dummyWordsLabel) dummyWordsLabel.innerText = i18next.t('dummy_words_label');

    const setButton = document.getElementById('bf-bit-size-submit');
    if (setButton) setButton.innerText = i18next.t('set_button');

    const infoSize = document.querySelector('.info-size strong');
    if (infoSize) infoSize.innerText = i18next.t('filter_size_info');

    const infoHashCount = document.querySelector('.info-hash-count strong');
    if (infoHashCount) infoHashCount.innerText = i18next.t('hash_functions_info');

    const infoElements = document.querySelector('.info-elements strong');
    if (infoElements) infoElements.innerText = i18next.t('elements_info');

    const infoFpr = document.querySelector('.info-fpr strong');
    if (infoFpr) infoFpr.innerText = i18next.t('fpr_info');

    const addItemInput = document.getElementById('add-item-input');
    if (addItemInput) addItemInput.placeholder = i18next.t('add_item_placeholder');

    const addItemButton = document.getElementById('add-item-submit');
    if (addItemButton) addItemButton.innerText = i18next.t('add_button');

    const checkItemInput = document.getElementById('check-item-input');
    if (checkItemInput) checkItemInput.placeholder = i18next.t('check_item_placeholder');

    const checkItemButton = document.getElementById('check-item-submit');
    if (checkItemButton) checkItemButton.innerText = i18next.t('check_button');

    const checkboxLabel = document.querySelector('.checkbox-label');
    if (checkboxLabel) checkboxLabel.innerText = i18next.t('disable_step_by_step');

    const nextStepButton = document.getElementById('next-step-button');
    if (nextStepButton) nextStepButton.innerText = i18next.t('next_step_button');

    const finishJourneyButton = document.getElementById('finish-journey-button');
    if (finishJourneyButton) finishJourneyButton.innerText = i18next.t('finish_execution_button');

    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) promptTextarea.placeholder = i18next.t('prompt_placeholder');

    return i18n;
}
