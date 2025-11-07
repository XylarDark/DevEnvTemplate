// File 30
// TEMPLATE_ONLY_START
function templateOnlyFunction30() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction30() {
  return 'production-30';
}

// @template-only
const templateVar30 = 'should be removed';

module.exports = {
  productionFunction30
};
