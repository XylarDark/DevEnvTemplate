// File 33
// TEMPLATE_ONLY_START
function templateOnlyFunction33() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction33() {
  return 'production-33';
}

// @template-only
const templateVar33 = 'should be removed';

module.exports = {
  productionFunction33
};
