import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { Directive, Input, ViewContainerRef, TemplateRef, OnInit } from '@angular/core';


@Directive({
    selector: '[appDisableContentByRole]'
})
export class DisableContentByRoleDirective implements OnInit {

    // the role the user must have 
    @Input() appDisableContentByRole: Array<string> = [] ;

    /**
     * @param {ViewContainerRef} viewContainerRef 
     * 	-- the location where we need to render the templateRef
     * @param {TemplateRef<any>} templateRef 
     *   -- the templateRef to be potentially rendered
     * @param {RolesService} rolesService 
     *   -- will give us access to the roles a user has
     */
    constructor(
        private readonly viewContainerRef: ViewContainerRef,
        private readonly templateRef: TemplateRef<any>,
        private readonly securityEncryptedService: SecurityEncryptedService
    ) { }

    ngOnInit() {
        
        const role = this.securityEncryptedService.getRolesDecrypted();

        if (role) {
            if (this.appDisableContentByRole.includes(role)) {
                this.viewContainerRef.clear();
            } else {
                this.viewContainerRef.createEmbeddedView(this.templateRef);
            }
        } else {
            this.viewContainerRef.clear();
        }
    }
}
