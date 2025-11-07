// File 85
// TEMPLATE_ONLY_START
function templateOnlyFunction85() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction85() {
  return 'production-85';
}

// @template-only
const templateVar85 = 'should be removed';

module.exports = {
  productionFunction85
};
