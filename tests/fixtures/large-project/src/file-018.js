// File 18
// TEMPLATE_ONLY_START
function templateOnlyFunction18() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction18() {
  return 'production-18';
}

// @template-only
const templateVar18 = 'should be removed';

module.exports = {
  productionFunction18
};
