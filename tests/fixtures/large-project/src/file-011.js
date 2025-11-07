// File 11
// TEMPLATE_ONLY_START
function templateOnlyFunction11() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction11() {
  return 'production-11';
}

// @template-only
const templateVar11 = 'should be removed';

module.exports = {
  productionFunction11
};
