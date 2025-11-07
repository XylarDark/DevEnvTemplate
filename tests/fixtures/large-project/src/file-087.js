// File 87
// TEMPLATE_ONLY_START
function templateOnlyFunction87() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction87() {
  return 'production-87';
}

// @template-only
const templateVar87 = 'should be removed';

module.exports = {
  productionFunction87
};
