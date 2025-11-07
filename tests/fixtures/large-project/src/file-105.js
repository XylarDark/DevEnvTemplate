// File 105
// TEMPLATE_ONLY_START
function templateOnlyFunction105() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction105() {
  return 'production-105';
}

// @template-only
const templateVar105 = 'should be removed';

module.exports = {
  productionFunction105
};
