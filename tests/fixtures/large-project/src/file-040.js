// File 40
// TEMPLATE_ONLY_START
function templateOnlyFunction40() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction40() {
  return 'production-40';
}

// @template-only
const templateVar40 = 'should be removed';

module.exports = {
  productionFunction40
};
