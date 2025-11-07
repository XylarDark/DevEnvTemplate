// File 50
// TEMPLATE_ONLY_START
function templateOnlyFunction50() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction50() {
  return 'production-50';
}

// @template-only
const templateVar50 = 'should be removed';

module.exports = {
  productionFunction50
};
