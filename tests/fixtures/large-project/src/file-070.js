// File 70
// TEMPLATE_ONLY_START
function templateOnlyFunction70() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction70() {
  return 'production-70';
}

// @template-only
const templateVar70 = 'should be removed';

module.exports = {
  productionFunction70
};
