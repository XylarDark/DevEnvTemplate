// File 117
// TEMPLATE_ONLY_START
function templateOnlyFunction117() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction117() {
  return 'production-117';
}

// @template-only
const templateVar117 = 'should be removed';

module.exports = {
  productionFunction117
};
