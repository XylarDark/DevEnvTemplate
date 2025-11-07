// File 37
// TEMPLATE_ONLY_START
function templateOnlyFunction37() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction37() {
  return 'production-37';
}

// @template-only
const templateVar37 = 'should be removed';

module.exports = {
  productionFunction37
};
