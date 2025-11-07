// File 88
// TEMPLATE_ONLY_START
function templateOnlyFunction88() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction88() {
  return 'production-88';
}

// @template-only
const templateVar88 = 'should be removed';

module.exports = {
  productionFunction88
};
