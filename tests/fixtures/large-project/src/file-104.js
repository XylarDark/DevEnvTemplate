// File 104
// TEMPLATE_ONLY_START
function templateOnlyFunction104() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction104() {
  return 'production-104';
}

// @template-only
const templateVar104 = 'should be removed';

module.exports = {
  productionFunction104
};
