// File 101
// TEMPLATE_ONLY_START
function templateOnlyFunction101() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction101() {
  return 'production-101';
}

// @template-only
const templateVar101 = 'should be removed';

module.exports = {
  productionFunction101
};
