import {test,expect} from '@playwright/test';
test('real P256 signature conveys a chosen bit with both independent signature checks',async({page})=>{
 await page.goto('./');await page.locator('input[name="bit"][value="1"]').check();await page.locator('#encode').click();
 await expect(page.locator('#verified')).toContainText('BOTH VERIFIERS');
 await expect(page.locator('#decoded')).toContainText('1 — read from r');
 await expect(page.locator('#verdict')).toContainText('ADDITIONAL SIGNAL PRESENT');
 await expect(page.locator('#r')).toHaveText(/^[0-9a-f]{64}$/);
 await page.locator('#tamper').click();await expect(page.locator('#verified')).toContainText('altered message rejected');
 await page.locator('#message').fill('changed');await expect(page.locator('#verified')).toContainText('Not verified');
 await page.locator('#deterministic').click();await expect(page.locator('#verdict')).toContainText('DETERMINISTIC OUTPUT');
});
