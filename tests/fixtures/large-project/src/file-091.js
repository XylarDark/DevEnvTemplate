// File 91
// TEMPLATE_ONLY_START
function templateOnlyFunction91() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction91() {
  return 'production-91';
}

// @template-only
const templateVar91 = 'should be removed';

module.exports = {
  productionFunction91
};
