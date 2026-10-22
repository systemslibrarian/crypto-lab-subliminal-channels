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
 await expect(page.locator('#verdict')).toHaveAttribute('data-tone','safe');
 await page.locator('input[name="bit"][value="0"]').check();
 await expect(page.locator('#verdict')).toContainText('Previous verdict retired');
 await expect(page.locator('#verified')).toHaveText('Not verified');
 await expect(page.locator('#decoded')).toHaveText('Not verified');
 await expect(page.locator('#r')).toHaveText('—');
 await expect(page.locator('#tamper')).toBeDisabled();
});

test('superseded signing cannot restore evidence after document or key changes',async({page})=>{
 await page.goto('./');
 await page.evaluate(()=>{
   (document.getElementById('encode') as HTMLButtonElement).click();
   const message=document.getElementById('message') as HTMLTextAreaElement;
   message.value='Changed while the signature was in flight';
   message.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await expect(page.locator('#encode')).toBeEnabled({timeout:30_000});
 await expect(page.locator('#verdict')).toContainText('Previous verdict retired');
 await expect(page.locator('#verified')).toHaveText('Not verified');
 await expect(page.locator('#decoded')).toHaveText('Not verified');
 await expect(page.locator('#r')).toHaveText('—');

 await page.evaluate(()=>{
   (document.getElementById('encode') as HTMLButtonElement).click();
   (document.getElementById('reset') as HTMLButtonElement).click();
 });
 await expect(page.locator('#encode')).toBeEnabled({timeout:30_000});
 await expect(page.locator('#lesson')).toContainText('Fresh synthetic signing key');
 await expect(page.locator('#verified')).toHaveText('Not verified');
 await expect(page.locator('#decoded')).toHaveText('Not verified');
});
