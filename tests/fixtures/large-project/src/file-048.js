// File 48
// TEMPLATE_ONLY_START
function templateOnlyFunction48() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction48() {
  return 'production-48';
}

// @template-only
const templateVar48 = 'should be removed';

module.exports = {
  productionFunction48
};
