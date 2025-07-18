const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAriaControls = require('../util/assertAriaControls');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertTabOrder = require('../util/assertTabOrder');
const exampleFile = 'content/patterns/disclosure/examples/disclosure-faq.html';

const ex = {
  buttonSelector: '#ex1 button',
  buttonSelectors: [
    '#ex1 ul li:nth-child(1) button',
    '#ex1 ul li:nth-child(2) button',
    '#ex1 ul li:nth-child(3) button',
    '#ex1 ul li:nth-child(4) button',
  ],
  answerSelectors: [
    '#ex1 ul li:nth-child(1) .desc',
    '#ex1 ul li:nth-child(2) .desc',
    '#ex1 ul li:nth-child(3) .desc',
    '#ex1 ul li:nth-child(4) .desc',
  ],
};

const waitAndCheckExpandedTrue = async function (t, selector) {
  return t.context.session.wait(
    async function () {
      const element = t.context.session.findElement(By.css(selector));
      return (await element.getAttribute('aria-expanded')) === 'true';
    },
    t.context.waitTime,
    'Timeout waiting for aria-expanded to change to true on element: ' +
      selector
  );
};

const waitAndCheckExpandedFalse = async function (t, selector) {
  return t.context.session.wait(
    async function () {
      const element = t.context.session.findElement(By.css(selector));
      return (await element.getAttribute('aria-expanded')) === 'false';
    },
    t.context.waitTime,
    'Timeout waiting for aria-expanded to change to false on element: ' +
      selector
  );
};

// Attributes

ariaTest(
  '"aria-controls" attribute on button',
  exampleFile,
  'button-aria-controls',
  async (t) => {
    await assertAriaControls(t, ex.buttonSelector);
  }
);

ariaTest(
  '"aria-expanded" attribute on button',
  exampleFile,
  'button-aria-expanded',
  async (t) => {
    await assertAttributeValues(t, ex.buttonSelector, 'aria-expanded', 'false');

    let buttons = await t.context.queryElements(t, ex.buttonSelector);
    for (let button of buttons) {
      await button.click();
    }

    let answers = await t.context.queryElements(t, ex.buttonSelector);
    for (let answer of answers) {
      t.true(
        await answer.isDisplayed(),
        'All answers should de displayed after clicking all questions'
      );
    }

    await assertAttributeValues(t, ex.buttonSelector, 'aria-expanded', 'true');
  }
);

// Keys

ariaTest('TAB should move focus', exampleFile, 'key-tab', async (t) => {
  await assertTabOrder(t, ex.buttonSelectors);

  let buttons = await t.context.queryElements(t, ex.buttonSelector);
  for (let button of buttons) {
    await button.click();
  }

  await assertTabOrder(t, ex.buttonSelectors);
});

ariaTest(
  'key ENTER expands details',
  exampleFile,
  'key-enter-or-space',
  async (t) => {
    for (let index = 0; index < ex.buttonSelectors.length; index++) {
      let buttonSelector = ex.buttonSelectors[index];
      let answerSelector = ex.answerSelectors[index];
      let button = await t.context.session.findElement(By.css(buttonSelector));

      await button.sendKeys(Key.ENTER);

      t.true(
        await waitAndCheckExpandedTrue(t, buttonSelector),
        'Question should have aria-expanded true after sending ENTER: ' +
          buttonSelector
      );

      t.true(
        await t.context.session
          .findElement(By.css(answerSelector))
          .isDisplayed(),
        'Answer should be displayed after sending ENTER to button: ' +
          buttonSelector
      );

      await button.sendKeys(Key.ENTER);

      t.true(
        await waitAndCheckExpandedFalse(t, buttonSelector),
        'Question should have aria-expanded false after sending ENTER twice: ' +
          buttonSelector
      );

      t.false(
        await t.context.session
          .findElement(By.css(answerSelector))
          .isDisplayed(),
        'Answer should not be displayed after sending ENTER twice to button: ' +
          buttonSelector
      );
    }
  }
);

ariaTest(
  'key SPACE expands details',
  exampleFile,
  'key-enter-or-space',
  async (t) => {
    for (let index = 0; index < ex.buttonSelectors.length; index++) {
      let buttonSelector = ex.buttonSelectors[index];
      let answerSelector = ex.answerSelectors[index];
      let button = await t.context.session.findElement(By.css(buttonSelector));

      await button.sendKeys(Key.SPACE);

      t.true(
        await waitAndCheckExpandedTrue(t, buttonSelector),
        'Question should have aria-expanded true after sending SPACE: ' +
          buttonSelector
      );

      t.true(
        await t.context.session
          .findElement(By.css(answerSelector))
          .isDisplayed(),
        'Answer should be displayed after sending SPACE to button: ' +
          buttonSelector
      );

      await button.sendKeys(Key.SPACE);

      t.true(
        await waitAndCheckExpandedFalse(t, buttonSelector),
        'Question should have aria-expanded false after sending SPACE twice: ' +
          buttonSelector
      );

      t.false(
        await t.context.session
          .findElement(By.css(answerSelector))
          .isDisplayed(),
        'Answer should not be displayed after sending SPACE twice to button: ' +
          buttonSelector
      );
    }
  }
);
