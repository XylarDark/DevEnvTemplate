// File 100
// TEMPLATE_ONLY_START
function templateOnlyFunction100() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction100() {
  return 'production-100';
}

// @template-only
const templateVar100 = 'should be removed';

module.exports = {
  productionFunction100
};
