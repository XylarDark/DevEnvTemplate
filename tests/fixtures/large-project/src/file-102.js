// File 102
// TEMPLATE_ONLY_START
function templateOnlyFunction102() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction102() {
  return 'production-102';
}

// @template-only
const templateVar102 = 'should be removed';

module.exports = {
  productionFunction102
};
