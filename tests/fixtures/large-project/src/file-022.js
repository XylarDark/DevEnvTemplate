// File 22
// TEMPLATE_ONLY_START
function templateOnlyFunction22() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction22() {
  return 'production-22';
}

// @template-only
const templateVar22 = 'should be removed';

module.exports = {
  productionFunction22
};
